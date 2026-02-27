# 基础设施引导框架设计文档

## 1. 背景与目的

我们在构建一个 NestJS 微服务项目，需要一套健壮的基础设施（配置、日志、事件等）。这些基础设施具有**全局性**
——几乎每个模块都需要它们，但在应用启动的早期阶段，它们之间存在固有的**自举循环依赖**：

- 配置需要日志来记录加载过程，但日志需要配置来确定输出目标。
- 事件总线需要配置（连接信息）和日志（记录收发），但配置又可能需要事件来响应变更。
- 任何新加入的“整个项目都需要”的设施都可能卷入类似的循环。

这种循环依赖无法通过常规重构消除，因为它是系统启动时“自我意识”尚未完全建立时的固有矛盾。传统方案（如 `forwardRef`、`@Lazy`
）只是临时绕过，并未解决本质问题，且随着设施增多变得难以维护。

**我们的目标**：设计一个**声明式的引导框架**
，让每个基础设施模块自己描述其“引导阶段”和“运行时阶段”的实现以及它们之间的依赖关系，由核心协调器自动按序加载，从而彻底消除手动维护启动顺序的复杂性，并允许业务代码无感地使用这些设施。

## 2. 核心思想：引导界限

我们将应用启动划分为两个阶段：

- **引导阶段**：仅加载基础设施的**轻量实现**
  （例如基于控制台的日志、基于环境变量的配置、内存事件总线）。这些实现必须尽可能简单，它们之间可以存在依赖，但依赖图必须无环。引导阶段的实现负责为运行时阶段的启动提供基础能力。
- **运行时阶段**：当引导完成后，按需将每个基础设施升级为**完整实现**（例如文件/远程日志、动态配置中心、Kafka
  事件总线）。升级顺序由运行时依赖图保证。

这种分层将循环依赖限制在引导阶段内部，而引导阶段可以通过拓扑排序解决。

## 3. 模块化设计

### 3.1 基础设施模块的结构

每个基础设施模块（如 `ConfigModule`、`LoggerModule`、`EventModule`）应包含两个子模块：

- **引导模块**（`BootstrapModule`）：提供引导阶段的实现。必须导出该设施的服务接口（例如 `ConfigService`、`LoggerService`）。
- **运行时模块**（`RuntimeModule`）：提供运行时的完整实现。同样导出相同的服务接口。

模块通过自定义装饰器 `@Infrastructure` 声明其引导/运行时模块以及依赖关系：

```typescript
// 示例：日志模块
@Infrastructure({
  bootstrap: LoggerBootstrapModule,   // 引导模块类
  runtime: LoggerRuntimeModule,        // 运行时模块类
  bootstrapDeps: [],                    // 引导期依赖的其他基础设施模块（注意：这里是模块类，如 ConfigModule）
  runtimeDeps: [ConfigModule],          // 运行时依赖的其他基础设施模块
})
export class LoggerModule {
}
```

- `bootstrapDeps` 指定了该模块的**引导实现**所依赖的其他基础设施模块的**引导实现**。协调器会确保这些依赖模块的引导模块先被加载。
- `runtimeDeps` 指定了该模块的**运行时实现**所依赖的其他基础设施模块的**运行时实现**。协调器会在升级时检查这些依赖是否已升级为运行时。

注意：依赖的是**模块类**，而不是服务接口。这是因为我们想要表达的是对整个基础设施模块的依赖，而不仅仅是某个服务。协调器可以通过模块类找到对应的引导/运行时子模块。

### 3.2 引导协调器（`BootstrapCoordinator`）

协调器是一个核心服务，负责：

- **收集元数据**：扫描所有导入的模块，收集带有 `@Infrastructure` 装饰器的模块及其元数据。
- **构建引导依赖图**：根据 `bootstrapDeps` 建立模块间的引导依赖关系，进行拓扑排序。若检测到循环依赖，则启动时报错，提示开发者调整引导设计。
- **按序加载引导模块**：使用 NestJS 的 `ModuleRef` 动态创建每个引导模块的实例，并将其提供的服务绑定到对应的接口
  token（通过代理模式，见下文）。在此过程中，会利用 NestJS 的依赖注入将已加载的引导模块实例注入到后续模块的构造函数中（通过自定义
  provider 或动态模块导入）。
- **管理运行时升级**：提供 `upgrade(moduleClass, runtimeInstance)`
  方法，供运行时模块在自身初始化完成后调用。调用时会检查该模块的运行时依赖是否都已升级，若满足条件则执行升级（替换代理内部实现），并触发
  `{moduleName}.upgraded` 事件。
- **内部事件总线**：协调器内置一个简单的 `EventEmitter`，用于在引导和升级过程中传递事件（如 `config.ready`、`logger.ready`
  ），方便模块间协调。

### 3.3 代理模式实现无感切换

为了让业务代码始终通过同一接口使用设施，且无感于当前是引导还是运行时实现，我们采用代理模式：

- 为每个基础设施的服务接口（如 `ConfigService`）创建一个**代理 provider**。该代理内部持有一个指向当前实际实现的引用（初始为引导实例）。
- 代理会拦截所有属性访问和方法调用，将其转发给当前实际实现。
- 代理上附加一个 `__upgrade` 方法，供协调器调用以替换内部实现。
- 业务代码只需通过构造函数注入接口，得到的就是这个代理对象，后续无需任何改动。

示例代理工厂：

```typescript
// 在协调器中动态注册
const provider = {
  provide: ConfigService,
  useFactory: () => {
    let currentImpl = bootstrapImpl; // 初始为引导实例
    const proxy = new Proxy({}, {
      get(target, prop) {
        if (prop === '__upgrade') {
          return (newImpl) => {
            currentImpl = newImpl;
          };
        }
        return currentImpl[prop];
      }
    });
    return proxy;
  }
}
```

## 4. 开发流程计划

鉴于业务需求即将到来，我们需要在有限时间内完成一个**最小可行版本**，确保基础设施能正确引导，同时不阻塞业务开发。后续可根据实际需要迭代增强。

### 阶段一：核心协调器与基础元数据（1-2 天）

**目标**：实现引导依赖解析和引导模块的按序加载。

**任务**：

1. 定义 `@Infrastructure` 装饰器及元数据结构。
2. 创建 `BootstrapCoordinatorModule`，内含 `BootstrapCoordinator` 服务。该服务在 `onModuleInit` 时扫描所有模块，收集元数据。
3. 实现引导依赖图构建和拓扑排序算法，若发现循环依赖则抛出清晰错误。
4. 实现按序加载引导模块的能力：利用 `ModuleRef` 动态创建每个引导模块的实例，并确保其依赖的引导模块实例已存在于容器中（可通过临时注册
   provider 或手动注入）。
5. 为每个基础设施的服务接口创建代理 provider，并将引导实例设置为代理的初始实现。
6. 编写两个简单的示例模块（如配置和日志）验证引导顺序。

**产出**：一个能自动解析引导依赖并按正确顺序初始化引导模块的协调器。此时运行时模块尚未接入。

### 阶段二：运行时升级机制（1-2 天）

**目标**：支持运行时模块在条件满足时升级，并保证升级顺序。

**任务**：

1. 在协调器中添加 `upgrade(moduleClass, runtimeInstance)` 方法。调用时，检查该模块的 `runtimeDeps`
   中列出的模块是否都已升级（即其代理的当前实现已是运行时）。若未满足，可抛出错误或放入队列等待（初期简化：直接要求调用方确保依赖已就绪）。
2. 当升级成功时，更新对应代理的内部实现，并触发 `{moduleName}.upgraded` 事件。
3. 提供内部事件总线（简单 `EventEmitter`），供模块间通信。例如配置模块运行时加载完成后，发出 `config.loaded`
   事件，日志模块运行时监听此事件来初始化自己。
4. 在示例模块中演示运行时升级流程：配置模块手动触发加载（如从环境变量读取），完成后调用 `upgrade`；日志模块监听
   `config.loaded`，初始化后调用 `upgrade`。

**产出**：运行时模块可按需升级，且升级顺序可通过事件或手动保证。业务服务无感。

### 阶段三：完善与文档（1 天）

**目标**：确保框架稳定，编写清晰的开发指南。

**任务**：

1. 增加错误处理和日志输出，便于调试。
2. 编写详细的 README 或内部文档，说明如何创建新的基础设施模块、如何声明依赖、如何触发运行时升级。
3. 提供配置、日志、事件三个模块的完整示例，作为团队参考。
4. 添加简单的单元测试，验证依赖解析和升级流程。

### 阶段四：业务开发并行（长期）

- 在业务开发过程中，根据实际需求对框架进行小步优化（如支持异步升级、添加超时处理等）。
- 保持框架最小核心，避免过度设计。

## 5. 示例：配置与日志模块的协作

### 5.1 配置模块声明

```typescript
// config.module.ts
@Infrastructure({
  bootstrap: ConfigBootstrapModule,
  runtime: ConfigRuntimeModule,
  bootstrapDeps: [],        // 引导无依赖
  runtimeDeps: [],          // 运行时无依赖（或可依赖日志，但此处无）
})
export class ConfigModule {
}

// config-bootstrap.module.ts
@Module({
  providers: [ConfigBootstrapService], // 实现 ConfigService 接口
  exports: [ConfigService],
})
export class ConfigBootstrapModule {
}

// config-runtime.module.ts
@Module({
  providers: [ConfigRuntimeService],   // 实现 ConfigService 接口
  exports: [ConfigService],
})
export class ConfigRuntimeModule {
}
```

### 5.2 日志模块声明

```typescript
// logger.module.ts
@Infrastructure({
  bootstrap: LoggerBootstrapModule,
  runtime: LoggerRuntimeModule,
  bootstrapDeps: [],        // 引导无依赖（或可依赖配置引导？但为避免循环，引导日志通常无依赖）
  runtimeDeps: [ConfigModule], // 运行时依赖配置
})
export class LoggerModule {
}
```

### 5.3 引导流程

1. 协调器扫描到 ConfigModule 和 LoggerModule。
2. 构建引导依赖图：两者 `bootstrapDeps` 均为空，无依赖，可并行或按任意顺序加载。
3. 依次实例化 ConfigBootstrapModule 和 LoggerBootstrapModule，并将它们的服务通过代理绑定到对应 token。
4. 引导阶段完成，应用继续初始化。

### 5.4 运行时升级

假设在某个初始化服务中：

```typescript

@Injectable()
export class AppInitializer {
  constructor(
    private configService: ConfigService,  // 此时是代理，指向引导实现
    private loggerService: LoggerService,
    private coordinator: BootstrapCoordinator,
  ) {
  }
  
  async onApplicationBootstrap() {
    // 1. 加载远程配置
    const fullConfig = await fetchRemoteConfig();
    // 2. 创建配置运行时实例（假设 ConfigRuntimeService 需要配置数据）
    const configRuntime = new ConfigRuntimeService(fullConfig);
    // 3. 升级配置
    await this.coordinator.upgrade(ConfigModule, configRuntime);
    
    // 4. 配置升级后，日志模块运行时可以初始化
    // 日志模块运行时可能监听了 config.upgraded 事件，在事件处理中自行升级
    // 或者手动触发：
    const loggerRuntime = new LoggerRuntimeService(this.configService); // 此时 configService 已指向运行时
    await this.coordinator.upgrade(LoggerModule, loggerRuntime);
  }
}
```

在 LoggerRuntimeModule 内部，可以监听事件：

```typescript

@Injectable()
export class LoggerRuntimeService implements OnModuleInit {
  constructor(private coordinator: BootstrapCoordinator) {
    this.coordinator.on('ConfigModule.upgraded', () => {
      // 初始化完整日志
      this.init();
      this.coordinator.upgrade(LoggerModule, this);
    });
  }
}
```

## 6. 设计优势

- **声明式依赖**：每个模块明确列出引导和运行时依赖，协调器自动处理顺序，消除人为错误。
- **无感切换**：业务代码始终通过同一接口调用，无需关心当前是引导还是运行时。
- **可扩展**：新增基础设施只需按照规范编写模块并声明依赖，无需修改协调器。
- **健壮性**：引导依赖图检测循环依赖，启动时即暴露问题，避免运行时诡异故障。
- **渐进式**：可先实现核心功能，后续逐步增强，不影响业务开发。

## 7. 注意事项

- **引导依赖必须无环**：如果两个模块在引导阶段必须相互依赖，则说明它们中的一个或两个的引导实现设计得过于复杂，应简化（例如让日志引导始终输出到控制台，不依赖配置）。
- **运行时依赖解析**：升级时协调器仅检查依赖模块是否已升级，不负责自动触发依赖模块的升级。升级应由模块自身根据条件触发。
- **代理性能**：代理拦截会有微小开销，但对于基础设施服务（非高频调用）可以忽略。若担心，可在升级后直接将代理替换为实际实例（但需考虑已注入的引用）。
- **模块作用域**：引导模块和运行时模块不应声明为 `@Global`，以免干扰依赖解析。全局性由代理 provider 的 token 实现。

## 8. 后续迭代方向

- **支持异步升级等待**：允许 `upgrade` 返回 Promise，协调器可等待依赖模块升级完成。
- **自动升级触发器**：提供装饰器让运行时模块的方法自动在依赖就绪后调用。
- **降级机制**：若运行时模块初始化失败，可回退到引导实现并记录错误。
- **可视化依赖图**：开发时输出依赖图，便于调试。

## 9. 结语

本框架旨在解决基础设施模块在应用启动阶段的固有循环依赖问题，通过清晰的引导界限和声明式依赖管理，让开发者能够专注于业务逻辑，而将复杂的启动顺序交给协调器处理。我们将在接下来几天内完成最小可行版本的开发，确保项目能按时进入业务开发阶段，同时为未来的扩展留下空间。
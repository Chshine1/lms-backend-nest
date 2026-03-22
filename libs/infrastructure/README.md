# Infrastructure Module

## Purpose

Provides core cross-cutting infrastructure services for the entire application, including structured logging and
configuration management. This module is globally available to all apps and libraries.

## Architecture

The infrastructure module is designed around three main services: **LoggerService**, **ConfigurationService**, and an
internal **EventBusModule** (used only during bootstrap).

### Design Principles

The module follows a [Service Loader Pattern](./docs/adr/0003-service-loader-pattern.md) where each service exposes a
stable public interface while allowing internal implementation to evolve. Services receive dependencies through
constructor injection via dedicated `Dependencies` classes, enabling the loader to provide different implementations at
different bootstrapping stages.

Infrastructure bootstrapping
follows [Progressive Enhancement](./docs/adr/0002-progressive-infrastructure-bootstrapping.md), starting with minimal
dependencies and progressively adding more complex ones to resolve circular dependencies.

The [Event Bus](./docs/adr/0001-event-bus-bootstrap-only.md) is used exclusively during the bootstrap phase to
facilitate communication between submodules. It is not exported in the main module and is released after bootstrapping
completes.

See [ADR 0001: Centralized Infrastructure Usage](/docs/adr/0001-centralized-infrastructure-usage.md) for the rationale
behind requiring all services to use this module for logging and configuration.

### Key Components

- **LoggerService**: Provides structured logging with a sink-buffer architecture. Logs are written to an in-memory
  buffer first, then flushed to sinks.
- **ConfigurationService**: Uses class-validator for runtime configuration validation with a pipeline-based loading
  mechanism.
- **EventBusModule**: Internal module using `mitt` for bootstrap-time inter-submodule communication.

### Sink Implementations

The logging system provides the following sink types following the sink-buffer architecture (
see [ADR 0004](./docs/adr/0004-sink-buffer-architecture.md)):

| Sink              | Pattern        | Description                                  |
|-------------------|----------------|----------------------------------------------|
| `ConsoleSink`     | Base           | Writes logs to console as JSON               |
| `NullSink`        | Base           | Discards all logs (no-op)                    |
| `MulticastSink`   | Broadcasting   | Emits to multiple sinks in parallel          |
| `FailoverSink`    | Failover       | Attempts primary, falls back to alternatives |
| `FilterSink`      | Filtering      | Conditionally passes based on predicate      |
| `ConditionalSink` | Filtering      | Routes to different sinks based on predicate |
| `ProcessorSink`   | Transformation | Modifies entries before delegation           |

### Configuration Loaders

The configuration pipeline implements the pattern defined
in [ADR 0005](./docs/adr/0005-configuration-pipeline-pattern.md) with the following stages:

| Stage | Source                | Dependencies             | Key Features                          |
|-------|-----------------------|--------------------------|---------------------------------------|
| 1     | Environment variables | None                     | `SNAKE_CASE` → `camelCase` conversion |
| 2     | YAML files            | Environment schema       | Base path from env                    |
| 3     | AWS Parameter Store   | Environment + AWS schema | Hierarchical paths, type coercion     |

AWS Parameter Store loads from `/{basePath}/{environment}` and `/{basePath}/{environment}/{serviceName}`, with automatic
conversion of `Integer`, `Boolean`, and `String` parameter types.

## File Structure

```
libs/infrastructure/src/
├── configs/
│   ├── configuration/
│   │   ├── loaders/          # Configuration source implementations
│   │   ├── schemas/          # Configuration class schemas
│   │   └── loader-pipeline.middlewares.ts  # Pipeline middleware
│   └── logger/
│       ├── buffers/          # Log buffer implementations
│       └── sinks/            # Log sink implementations (console, etc.)
├── modules/
│   ├── configuration/
│   │   ├── configuration.errors.ts  # Configuration-specific errors
│   │   ├── configuration.loader.ts  # Configuration loader service
│   │   ├── configuration.module.ts
│   │   ├── configuration.service.ts
│   │   └── pipeline/         # Loading pipeline components
│   ├── event-bus/
│   │   ├── event-bus.module.ts
│   │   └── event-bus.service.ts
│   └── logger/
│       ├── contracts/        # Interfaces and types (buffer, sink, etc.)
│       ├── errors/           # Logger-specific errors
│       ├── logger.loader.ts  # Logger bootstrap loader
│       ├── logger.module.ts
│       ├── logger.service.ts
│       ├── services/         # Helper services (enrichment)
│       └── sinks/            # Logger sink implementations
├── infrastructure.errors.ts  # Shared infrastructure errors
├── infrastructure.module.ts  # Main module (empty shell with forRoot)
└── infrastructure.module.spec.ts
```

## Internal Dependencies

### Shared Libraries

- `@app/contracts` - For `BaseError`, `ErrorCode`, and shared interfaces

### External Libraries

- `class-transformer` - For DTO transformation in configuration
- `class-validator` - For runtime validation of configuration objects
- `mitt` - Lightweight event emitter for the bootstrap-only event bus

### Internal Sub-modules

The module contains three submodules that can be imported independently:

- `LoggerModule` - Logging services
- `ConfigurationModule` - Configuration services
- `EventBusModule` - Event bus (internal, not exported in main module)

## Coding Conventions

### Service Dependencies Pattern

Each service follows the dependencies pattern:

```typescript

@Injectable()
export class ServiceDependencies {
  constructor(public enrichmentService: EnrichmentService) {
  }
}

@Injectable()
export class Service {
  constructor(private readonly dependencies: ServiceDependencies) {
  }
}
```

### Module Structure

Modules use factory providers to create service instances:

```typescript

@Module({
  providers: [
    ServiceDependencies,
    {
      provide: Service,
      useFactory: (dep: ServiceDependencies): Service => new Service(dep),
      inject: [ServiceDependencies],
    },
  ],
  exports: [Service],
})
export class ServiceModule {
}
```

### Error Handling

Custom errors extend `InfrastructureError` from the root `infrastructure.errors.ts`. Each submodule may also define
specific errors (e.g., `configuration.errors.ts`).

## Testing

Tests follow the project-wide patterns defined in `docs/TestingStandards.md`. Key testing aspects for this module:

- **Unit tests** for services using mocked dependencies
- **Integration tests** for modules with real dependency injection
- **Loader tests** to verify progressive bootstrapping behavior

Mock dependencies should use `jest.fn()` and `jest.Mocked<T>` for typed mocks.

## Local Development

The module is part of a NestJS monorepo. Import it in your application:

```typescript
import { InfrastructureModule } from '@app/infrastructure/infrastructure.module';

@Module({
  imports: [InfrastructureModule.forRoot()],
})
export class AppModule {
}
```

Individual submodules can be imported separately if you only need specific functionality:

```typescript
import { LoggerModule } from '@app/infrastructure/modules/logger/logger.module';
import { ConfigurationModule } from '@app/infrastructure/modules/configuration/configuration.module';
```

import { Injectable, Type, OnModuleInit } from '@nestjs/common';
import { EventEmitter } from 'events';
import {
  IBootstrapCoordinator,
  InfrastructureModuleState,
  ModuleStateInfo,
} from '@app/infrastructure/interfaces/bootstrap-coordinator.interface';
import { ProxyProviderFactory } from '@app/infrastructure/services/proxy-provider.factory';
import { getInfrastructureMetadata } from '@app/infrastructure/decorators/infrastructure.decorator';

@Injectable()
export class BootstrapCoordinatorService
  implements IBootstrapCoordinator, OnModuleInit
{
  private readonly eventEmitter = new EventEmitter();
  private readonly moduleStates = new Map<Type, ModuleStateInfo>();
  private readonly dependencyGraph = new Map<Type, Set<Type>>();
  private readonly reverseDependencyGraph = new Map<Type, Set<Type>>();
  private readonly proxyProviders = new Map<Type, unknown>();

  onModuleInit(): Promise<void> {
    return this.bootstrap();
  }

  registerInfrastructureModule(moduleClass: Type): void {
    const metadata = getInfrastructureMetadata(moduleClass);
    if (metadata === undefined) {
      throw new Error(
        `Module ${moduleClass.name} is not decorated with @Infrastructure`,
      );
    }

    this.moduleStates.set(moduleClass, {
      moduleClass,
      state: InfrastructureModuleState.PENDING,
    });

    this.buildDependencyGraph(moduleClass, metadata.bootstrapDeps);
  }

  async bootstrap(): Promise<void> {
    const sortedModules = this.topologicalSort();

    for (const moduleClass of sortedModules) {
      await this.bootstrapModule(moduleClass);
    }

    this.emit('bootstrap.completed');
  }

  upgrade(moduleClass: Type, runtimeInstance: unknown): Promise<void> {
    const stateInfo = this.moduleStates.get(moduleClass);
    if (stateInfo === undefined) {
      throw new Error(`Module ${moduleClass.name} is not registered`);
    }

    if (stateInfo.state !== InfrastructureModuleState.BOOTSTRAPPED) {
      throw new Error(
        `Module ${moduleClass.name} must be bootstrapped before upgrade`,
      );
    }

    const metadata = getInfrastructureMetadata(moduleClass);
    if (metadata !== undefined) {
      for (const depModule of metadata.runtimeDeps) {
        const depState = this.moduleStates.get(depModule);
        if (
          depState === undefined ||
          depState.state !== InfrastructureModuleState.UPGRADED
        ) {
          throw new Error(
            `Runtime dependency ${depModule.name} is not upgraded`,
          );
        }
      }
    }

    stateInfo.runtimeInstance = runtimeInstance;
    stateInfo.state = InfrastructureModuleState.UPGRADED;

    this.emit(`${moduleClass.name}.upgraded`, runtimeInstance);
    this.emit('upgrade', moduleClass, runtimeInstance);

    return Promise.resolve();
  }

  isUpgraded(moduleClass: Type): boolean {
    const stateInfo = this.moduleStates.get(moduleClass);
    if (stateInfo === undefined) {
      throw new Error(`Module ${moduleClass.name} is not registered`);
    }
    return stateInfo.state === InfrastructureModuleState.UPGRADED;
  }

  getCurrentImplementation(moduleClass: Type): unknown {
    const stateInfo = this.moduleStates.get(moduleClass);
    if (!stateInfo) return undefined;

    return stateInfo.runtimeInstance || stateInfo.bootstrapInstance;
  }

  on(event: string, listener: (...args: unknown[]) => void): void {
    this.eventEmitter.on(event, listener);
  }

  off(event: string, listener: (...args: unknown[]) => void): void {
    this.eventEmitter.off(event, listener);
  }

  emit(event: string, ...args: unknown[]): void {
    this.eventEmitter.emit(event, ...args);
  }

  private buildDependencyGraph(moduleClass: Type, dependencies: Type[]): void {
    let depSet = this.dependencyGraph.get(moduleClass);
    if (depSet === undefined) {
      depSet = new Set<Type>();
      this.dependencyGraph.set(moduleClass, depSet);
    }

    for (const dep of dependencies) {
      depSet.add(dep);

      let reversedDepSet = this.reverseDependencyGraph.get(dep);
      if (reversedDepSet === undefined) {
        reversedDepSet = new Set<Type>();
        this.reverseDependencyGraph.set(dep, reversedDepSet);
      }

      reversedDepSet.add(moduleClass);
    }
  }

  private topologicalSort(): Type[] {
    const inDegree = new Map<Type, number>();
    const queue: Type[] = [];
    const result: Type[] = [];

    for (const moduleClass of this.moduleStates.keys()) {
      inDegree.set(moduleClass, 0);
    }

    for (const dependencies of this.dependencyGraph.values()) {
      for (const dep of dependencies) {
        inDegree.set(dep, (inDegree.get(dep) || 0) + 1);
      }
    }

    for (const [moduleClass, degree] of inDegree) {
      if (degree === 0) {
        queue.push(moduleClass);
      }
    }

    for (
      let current = queue.shift();
      current !== undefined;
      current = queue.shift()
    ) {
      result.push(current);

      const dependencies = this.dependencyGraph.get(current);
      if (dependencies) {
        for (const dep of dependencies) {
          const newDegree = (inDegree.get(dep) || 0) - 1;
          inDegree.set(dep, newDegree);

          if (newDegree === 0) {
            queue.push(dep);
          }
        }
      }
    }

    if (result.length !== this.moduleStates.size) {
      const cyclicModules = Array.from(this.moduleStates.keys()).filter(
        (moduleClass) => !result.includes(moduleClass),
      );
      throw new Error(
        `Circular dependency detected among modules: ${cyclicModules.map((m) => m.name).join(', ')}`,
      );
    }

    return result;
  }

  private bootstrapModule(moduleClass: Type): Promise<void> {
    const metadata = getInfrastructureMetadata(moduleClass);
    if (metadata === undefined) {
      throw new Error(`Metadata not found for module ${moduleClass.name}`);
    }

    try {
      const bootstrapInstance = new metadata.bootstrap();

      const proxyProvider = this.createProxyProvider(
        moduleClass,
        bootstrapInstance,
      );
      this.proxyProviders.set(moduleClass, proxyProvider);

      const stateInfo = this.moduleStates.get(moduleClass);
      if (stateInfo) {
        stateInfo.bootstrapInstance = bootstrapInstance;
        stateInfo.state = InfrastructureModuleState.BOOTSTRAPPED;
      }

      this.emit(`${moduleClass.name}.bootstrapped`, bootstrapInstance);
    } catch (error) {
      const stateInfo = this.moduleStates.get(moduleClass);
      if (stateInfo) {
        stateInfo.state = InfrastructureModuleState.ERROR;
        stateInfo.error = error as Error;
      }
      throw error;
    }
    return Promise.resolve();
  }

  private createProxyProvider(
    moduleClass: Type,
    bootstrapInstance: object,
  ): unknown {
    return ProxyProviderFactory.create(
      moduleClass.name,
      bootstrapInstance,
      (newImpl: unknown) => {
        const stateInfo = this.moduleStates.get(moduleClass);
        if (stateInfo) {
          stateInfo.runtimeInstance = newImpl;
        }
      },
    );
  }
}

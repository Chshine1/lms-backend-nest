import { Injectable, Type, OnModuleInit } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { BootstrapCoordinatorService } from '@app/infrastructure/bootstrap-coordinator.service';
import { getInfrastructureMetadata } from '@app/infrastructure/decorators/infrastructure.decorator';

@Injectable()
export class InfrastructureRegistryService implements OnModuleInit {
  private registeredModules = new Set<Type>();

  constructor(
    private readonly moduleRef: ModuleRef,
    private readonly coordinator: BootstrapCoordinatorService,
  ) {}

  onModuleInit(): Promise<void> {
    return this.scanAndRegisterModules();
  }

  private async scanAndRegisterModules(): Promise<void> {
    const modules = this.moduleRef['container']?.modules || new Map();

    for (const [token, module] of modules) {
      if (this.isInfrastructureModule(module.metatype)) {
        await this.registerModule(module.metatype);
      }
    }
  }

  private isInfrastructureModule(moduleClass: Type): boolean {
    return !!getInfrastructureMetadata(moduleClass);
  }

  private async registerModule(moduleClass: Type): Promise<void> {
    if (this.registeredModules.has(moduleClass)) {
      return;
    }

    const metadata = getInfrastructureMetadata(moduleClass);
    if (!metadata) {
      return;
    }

    this.coordinator.registerInfrastructureModule(moduleClass);
    this.registeredModules.add(moduleClass);

    for (const depModule of metadata.bootstrapDeps) {
      if (!this.registeredModules.has(depModule)) {
        await this.registerModule(depModule);
      }
    }
  }

  register(moduleClass: Type): void {
    if (this.registeredModules.has(moduleClass)) {
      return;
    }

    if (!this.isInfrastructureModule(moduleClass)) {
      throw new Error(
        `Module ${moduleClass.name} is not an infrastructure module`,
      );
    }

    this.coordinator.registerInfrastructureModule(moduleClass);
    this.registeredModules.add(moduleClass);
  }
}

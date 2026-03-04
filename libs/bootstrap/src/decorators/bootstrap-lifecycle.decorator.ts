import { Inject } from '@nestjs/common';
import { BootstrapManager } from '../interfaces/bootstrap-manager.interface';
import { BootstrapLifecycle } from '../interfaces/bootstrap-phase.interface';

export const BOOTSTRAP_MANAGER_TOKEN = Symbol('BOOTSTRAP_MANAGER');

export const InjectBootstrapManager = (): PropertyDecorator &
  ParameterDecorator => Inject(BOOTSTRAP_MANAGER_TOKEN);

export interface BootstrapLifecycleAware {
  bootstrapManager: BootstrapManager;
  preBootstrap?: () => Promise<void> | void;
  bootstrap?: () => Promise<void> | void;
  postBootstrap?: () => Promise<void> | void;
  onModuleInit?: () => Promise<void> | void;
  onModuleDestroy?: () => Promise<void> | void;
}

export function BootstrapLifecycleHandler() {
  return function (target: {
    new (...args: never[]): BootstrapLifecycleAware;
  }): void {
    const prototype = target.prototype as BootstrapLifecycleAware;
    const originalOnModuleInit = prototype.onModuleInit;
    const originalOnModuleDestroy = prototype.onModuleDestroy;

    prototype.onModuleInit = async function (
      this: BootstrapLifecycleAware,
    ): Promise<void> {
      const lifecycle: BootstrapLifecycle = {
        preBootstrap: this.preBootstrap?.bind(this),
        bootstrap: this.bootstrap?.bind(this),
        postBootstrap: this.postBootstrap?.bind(this),
      };
      this.bootstrapManager.registerLifecycle(lifecycle);

      if (originalOnModuleInit) {
        await originalOnModuleInit.call(this);
      }
    };

    prototype.onModuleDestroy = async function (
      this: BootstrapLifecycleAware,
    ): Promise<void> {
      const lifecycle: BootstrapLifecycle = {
        preBootstrap: this.preBootstrap?.bind(this),
        bootstrap: this.bootstrap?.bind(this),
        postBootstrap: this.postBootstrap?.bind(this),
      };
      this.bootstrapManager.unregisterLifecycle(lifecycle);

      if (originalOnModuleDestroy) {
        await originalOnModuleDestroy.call(this);
      }
    };
  };
}

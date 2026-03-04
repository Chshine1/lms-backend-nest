import { Inject } from '@nestjs/common';
import { BootstrapManager } from '../interfaces/bootstrap-manager.interface';
import { BootstrapLifecycle } from '../interfaces/bootstrap-phase.interface';

export const BOOTSTRAP_MANAGER_TOKEN = Symbol('BOOTSTRAP_MANAGER');

export const InjectBootstrapManager = (): PropertyDecorator &
  ParameterDecorator => Inject(BOOTSTRAP_MANAGER_TOKEN);

export interface BootstrapLifecycleAware {
  bootstrapManager: BootstrapManager;
  preBootstrap?: () => Promise<void>;
  bootstrap?: () => Promise<void>;
  postBootstrap?: () => Promise<void>;
  onModuleInit?: () => Promise<void>;
  onModuleDestroy?: () => Promise<void>;
}

export interface BootstrapLifecycleHandlerOptions {
  autoRegister?: boolean;
  enableErrorHandling?: boolean;
}

type BootstrapLifecycleAwareConstructor = new (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ...args: any[]
) => BootstrapLifecycleAware;

export function BootstrapLifecycleHandler<
  T extends BootstrapLifecycleAwareConstructor,
>(options: BootstrapLifecycleHandlerOptions = {}) {
  const { autoRegister = true, enableErrorHandling = true } = options;

  return function (target: T): T {
    return class extends target {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      constructor(...args: any[]) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        super(...args);

        if (autoRegister) {
          this.setupLifecycleHandlers();
        }
      }

      private setupLifecycleHandlers(): void {
        const originalOnModuleInit = this.onModuleInit;
        const originalOnModuleDestroy = this.onModuleDestroy;

        this.onModuleInit = async (): Promise<void> => {
          try {
            const lifecycle: BootstrapLifecycle = {
              preBootstrap: this.preBootstrap?.bind(this),
              bootstrap: this.bootstrap?.bind(this),
              postBootstrap: this.postBootstrap?.bind(this),
            } as BootstrapLifecycle;

            this.bootstrapManager.registerLifecycle(lifecycle);

            if (originalOnModuleInit) {
              await originalOnModuleInit.call(this);
            }
          } catch (error) {
            if (enableErrorHandling) {
              console.error(
                'BootstrapLifecycleHandler: Failed to initialize',
                error,
              );
            }
            throw error;
          }
        };

        this.onModuleDestroy = async (): Promise<void> => {
          try {
            const lifecycle: BootstrapLifecycle = {
              preBootstrap: this.preBootstrap?.bind(this),
              bootstrap: this.bootstrap?.bind(this),
              postBootstrap: this.postBootstrap?.bind(this),
            } as BootstrapLifecycle;

            this.bootstrapManager.unregisterLifecycle(lifecycle);

            if (originalOnModuleDestroy) {
              await originalOnModuleDestroy.call(this);
            }
          } catch (error) {
            if (enableErrorHandling) {
              console.error(
                'BootstrapLifecycleHandler: Failed to destroy',
                error,
              );
            }
          }
        };
      }
    };
  };
}

import { DynamicModule, Module, Provider } from '@nestjs/common';
import { BootstrapService } from './bootstrap.service';
import { BootstrapManagerService } from './services/bootstrap-manager.service';
import { BootstrapEventBusService } from './services/bootstrap-event-bus.service';
import { BOOTSTRAP_MANAGER_TOKEN } from './decorators/bootstrap-lifecycle.decorator';

export interface BootstrapModuleOptions {
  enableEventBus?: boolean;
  defaultTimeout?: number;
}

@Module({})
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class BootstrapModule {
  static forRoot(options: BootstrapModuleOptions = {}): DynamicModule {
    const { enableEventBus = true } = options;

    const providers: Provider[] = [
      BootstrapManagerService,
      {
        provide: BOOTSTRAP_MANAGER_TOKEN,
        useExisting: BootstrapManagerService,
      },
      BootstrapService,
    ];

    if (enableEventBus) {
      providers.push(BootstrapEventBusService);
    }

    return {
      module: BootstrapModule,
      providers,
      exports: [
        BootstrapService,
        BootstrapManagerService,
        BOOTSTRAP_MANAGER_TOKEN,
        ...(enableEventBus ? [BootstrapEventBusService] : []),
      ],
    };
  }

  static forFeature(): DynamicModule {
    return {
      module: BootstrapModule,
      imports: [BootstrapModule.forRoot()],
      exports: [BootstrapService, BOOTSTRAP_MANAGER_TOKEN],
    };
  }
}

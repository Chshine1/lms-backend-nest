import { DynamicModule, Module, Provider } from '@nestjs/common';
import { BootstrapService } from './bootstrap.service';
import { BootstrapManagerService } from './services/bootstrap-manager.service';
import { BootstrapEventBusService } from './services/bootstrap-event-bus.service';
import { BOOTSTRAP_MANAGER_TOKEN } from './decorators/bootstrap-lifecycle.decorator';
import { BootstrapConfig } from './interfaces/bootstrap-config.interface';

export interface BootstrapModuleOptions {
  config?: Partial<BootstrapConfig>;
  enableEventBus?: boolean;
}

@Module({})
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class BootstrapModule {
  static forRoot(options: BootstrapModuleOptions = {}): DynamicModule {
    const { config = {}, enableEventBus = true } = options;

    const providers: Provider[] = [
      {
        provide: BootstrapManagerService,
        useFactory: () => new BootstrapManagerService(config),
      },
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

  static forFeature(options: BootstrapModuleOptions = {}): DynamicModule {
    return {
      module: BootstrapModule,
      imports: [BootstrapModule.forRoot(options)],
      exports: [BootstrapService, BOOTSTRAP_MANAGER_TOKEN],
    };
  }
}

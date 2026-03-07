import { DynamicModule, Module, Provider, forwardRef } from '@nestjs/common';
import {
  ConfigurationService,
  LOADER_REGISTRY_TOKEN,
} from './configuration.service';
import { LoaderDefinition } from '@app/config-lib/interfaces/loader.config';
import { ConfigurationContainer } from '@app/config-lib/configuration-container';
import { LoggerService } from '@app/logger/logger.service';
import { LoggerModule } from '@app/logger/logger.module';
import { LogLevel } from '@app/logger/core/contracts/log-entry.interface';
import {
  BootstrapEventBusSymbol,
  BootstrapEvents,
  InfrastructureModule,
} from '@app/infrastructure/infrastructure.module';
import type { Emitter } from 'mitt';

export interface ConfigLibModuleOptions {
  loadersPipeline: LoaderDefinition[];
}

@Module({})
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class ConfigLibModule {
  static forRoot(options: ConfigLibModuleOptions): DynamicModule {
    const loadersProvider: Provider = {
      provide: LOADER_REGISTRY_TOKEN,
      useValue: options.loadersPipeline,
    };

    const configServiceProvider: Provider = ConfigurationService;

    const configContainerProvider: Provider = {
      provide: ConfigurationContainer,
      useFactory: async (
        configService: ConfigurationService,
        loggerService: LoggerService,
        eventBus: Emitter<BootstrapEvents>,
      ) => {
        void loggerService.log({
          level: LogLevel.info,
          message: 'Start loading configurations.',
        });
        const config = await configService.load();
        void loggerService.log({
          level: LogLevel.info,
          message: 'Configurations loaded.',
        });
        eventBus.emit('config.loaded', config);

        return new ConfigurationContainer(config);
      },
      inject: [ConfigurationService, LoggerService, BootstrapEventBusSymbol],
    };

    return {
      module: ConfigLibModule,
      imports: [
        InfrastructureModule,
        forwardRef(() =>
          LoggerModule.forRoot({
            config: { level: LogLevel.info },
          }),
        ),
      ],
      providers: [
        loadersProvider,
        configServiceProvider,
        configContainerProvider,
      ],
      exports: [ConfigurationContainer],
    };
  }
}

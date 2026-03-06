import { DynamicModule, Module, Provider, OnModuleInit } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import {
  ConfigurationService,
  LOADER_REGISTRY_TOKEN,
} from './configuration.service';
import { LoaderDefinition } from '@app/config-lib/interfaces/loader.config';
import { ConfigurationContainer } from '@app/config-lib/configuration-container';
import { LoggerModule } from '@app/logger/logger.module';
import { LoggerService } from '@app/logger/logger.service';
import { LogLevel } from '@app/contracts/config/logger-lib.config';

export interface ConfigLibModuleOptions<
  TPipeline extends LoaderDefinition<object, unknown[]>[],
> {
  loadersPipeline: TPipeline;
}

@Module({})
export class ConfigLibModule implements OnModuleInit {
  private loggerService!: LoggerService;

  constructor(private readonly moduleRef: ModuleRef) {}

  onModuleInit(): void {
    this.loggerService = this.moduleRef.get(LoggerService, { strict: false });
  }

  static forRoot<TPipeline extends LoaderDefinition<object, unknown[]>[]>(
    options: ConfigLibModuleOptions<TPipeline>,
  ): DynamicModule {
    const loadersProvider: Provider = {
      provide: LOADER_REGISTRY_TOKEN,
      useValue: options.loadersPipeline,
    };

    const configServiceProvider: Provider = ConfigurationService;

    const configContainerProvider: Provider = {
      provide: ConfigurationContainer,
      useFactory: async (
        configService: ConfigurationService<TPipeline>,
        configLibModule: ConfigLibModule,
      ) => {
        const loggerService = configLibModule.loggerService;
        loggerService.info('Start loading configurations...');
        const config = await configService.load();
        loggerService.info('Configurations loaded');

        loggerService.updateConfig();
        return new ConfigurationContainer(config);
      },
      inject: [ConfigurationService, ConfigLibModule],
    };

    return {
      module: ConfigLibModule,
      imports: [
        LoggerModule.forRoot({
          config: { bootstrap: true, level: LogLevel.info },
        }),
      ],
      providers: [
        loadersProvider,
        configServiceProvider,
        configContainerProvider,
        ConfigLibModule,
      ],
      exports: [ConfigurationContainer],
    };
  }
}

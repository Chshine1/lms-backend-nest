import { DynamicModule, Module, Provider } from '@nestjs/common';
import {
  ConfigurationService,
  LOADER_REGISTRY_TOKEN,
} from './configuration.service';
import { LoaderDefinition } from '@app/config-lib/interfaces/loader.config';
import { ConfigurationContainer } from '@app/config-lib/configuration-container';
import { LoggerModule } from '@app/logger/logger.module';
import { LoggerService } from '@app/logger/logger.service';
import { instanceToPlain, plainToInstance, Type } from 'class-transformer';
import {
  LoggerLibConfig,
  LogLevel,
} from '@app/contracts/config/logger-lib.config';
import { IsDefined, IsObject, validate, ValidateNested } from 'class-validator';
import { LoggerConfig } from '@app/logger/interfaces/logger-config.interface';

export interface ConfigLibModuleOptions<
  TPipeline extends LoaderDefinition<object, unknown[]>[],
> {
  loadersPipeline: TPipeline;
}

@Module({})
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class ConfigLibModule {
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
        loggerService: LoggerService,
      ) => {
        loggerService.info('Start loading configurations...');
        const config = await configService.load();
        loggerService.info('Configurations loaded');

        loggerService.updateConfig(
          await this.getPostBootstrapLoggerServiceConfiguration(
            config,
            loggerService,
          ),
        );
        return new ConfigurationContainer(config);
      },
      inject: [ConfigurationService, LoggerService],
    };

    return {
      module: ConfigLibModule,
      imports: [
        LoggerModule.forRoot({ bootstrap: true, level: LogLevel.info }),
      ],
      providers: [
        loadersProvider,
        configServiceProvider,
        configContainerProvider,
      ],
      exports: [ConfigurationContainer, LoggerModule],
    };
  }

  private static async getPostBootstrapLoggerServiceConfiguration(
    config: unknown,
    loggerService: LoggerService,
  ): Promise<LoggerConfig> {
    class LoggerConfigurationSection {
      @IsDefined()
      @IsObject()
      @ValidateNested()
      @Type(() => LoggerLibConfig)
      logger!: LoggerLibConfig;
    }
    const loggerSection = plainToInstance(LoggerConfigurationSection, config);
    const errors = await validate(loggerSection);
    if (errors.length > 0) {
      loggerService.fatal('Logger configuration failed');
      throw new Error();
    }

    return {
      bootstrap: false,
      ...(instanceToPlain(loggerSection.logger) as Pick<
        LoggerLibConfig,
        keyof LoggerLibConfig
      >),
    };
  }
}

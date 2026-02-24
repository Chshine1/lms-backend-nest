import { DynamicModule, Module, Provider } from '@nestjs/common';
import { ConfigLoaderService } from './config-loader.service';
import { defaultLoaderOptions } from '@app/config-lib/constants/default-loader.options';
import type { LoaderOptions } from '@app/config-lib/interfaces/loader-options.interface';
import { ConfigHolder } from '@app/config-lib/config-holder';
import { LoggerModule } from '@app/logger/logger.module';
import { LoggerService } from '@app/logger/logger.service';
import { instanceToPlain, plainToInstance, Type } from 'class-transformer';
import { LoggerLibConfig } from '@app/contracts/config/logger-lib.config';
import { IsDefined, validate, ValidateNested } from 'class-validator';

export interface ConfigLibModuleOptions<
  TOrder extends readonly (keyof LoaderOptions)[],
> {
  order: TOrder;
}

@Module({})
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class ConfigLibModule {
  static forRoot<TOrder extends readonly (keyof LoaderOptions)[]>(
    options: ConfigLibModuleOptions<TOrder>,
  ): DynamicModule {
    const loadersProvider: Provider = {
      provide: 'LOADERS',
      useValue: defaultLoaderOptions,
    };

    const loaderServiceProvider: Provider = ConfigLoaderService;

    const configHolderProvider: Provider = {
      provide: ConfigHolder,
      useFactory: async (
        loaderService: ConfigLoaderService,
        logger: LoggerService,
      ) => {
        logger.info('Start loading configurations...');
        const config = await loaderService.load(options.order);
        logger.info('Configurations loaded');

        class LoggerSection {
          @IsDefined()
          @ValidateNested()
          @Type(() => LoggerLibConfig)
          logger!: LoggerLibConfig;
        }
        const loggerSection = plainToInstance(LoggerSection, config);
        const errors = await validate(loggerSection);
        if (errors.length > 0) {
          logger.error('');
          throw new Error();
        }
        logger.updateConfig({
          bootstrap: false,
          ...(instanceToPlain(loggerSection.logger) as Pick<
            LoggerLibConfig,
            keyof LoggerLibConfig
          >),
        });
        return new ConfigHolder(config);
      },
      inject: [ConfigLoaderService, LoggerService],
    };

    return {
      module: ConfigLibModule,
      imports: [LoggerModule.forRoot({ bootstrap: true, level: 'info' })],
      providers: [loadersProvider, loaderServiceProvider, configHolderProvider],
      exports: [ConfigHolder, LoggerModule],
    };
  }
}

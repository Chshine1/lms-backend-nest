import { Module, DynamicModule, Provider, forwardRef } from '@nestjs/common';
import { LoggerConfig } from '@app/logger/core/contracts/logger-config.interface';
import { LoggerPipeline } from '@app/logger/core/contracts/logger-pipeline.abstraction';
import { PinoFactory } from './config/implementations/pino-factory';
import { DefaultPipeline } from './config/pipeline/default-pipeline';
import { BufferService } from './core/services/buffer.service';
import { LoggerService } from '@app/logger/logger.service';
import { InfrastructureModule } from '@app/infrastructure/infrastructure.module';
import { ConfigLibModule } from '@app/config-lib/config-lib.module';
import { globalConfigLoaderPipeline } from '@app/contracts/config-loader-pipeline.global';
import {
  LoggerFactory,
  LoggerInstance,
} from '@app/logger/core/contracts/logger.abstraction';

export interface LoggerModuleOptions {
  config: LoggerConfig;
  loggerFactory?: LoggerFactory;
  pipeline?: LoggerPipeline;
}

@Module({})
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class LoggerModule {
  static forRoot(options: LoggerModuleOptions): DynamicModule {
    const providers: Provider[] = [
      {
        provide: LoggerInstance,
        useFactory: (): LoggerInstance => {
          const factory = options.loggerFactory || new PinoFactory();
          return factory.createLogger(options.config);
        },
      },
      {
        provide: LoggerPipeline,
        useFactory: () => options.pipeline || new DefaultPipeline(),
      },
      BufferService,
      LoggerService,
    ];

    return {
      module: LoggerModule,
      imports: [
        InfrastructureModule,
        forwardRef(() =>
          ConfigLibModule.forRoot({
            loadersPipeline: globalConfigLoaderPipeline,
          }),
        ),
      ],
      providers,
      exports: [LoggerService],
    };
  }
}

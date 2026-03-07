import { Module, DynamicModule, Provider, forwardRef } from '@nestjs/common';
import { LoggerConfig } from '@app/logger/abstractions/logger-config.interface';
import { LoggerPipeline } from '@app/logger/abstractions/logger-pipeline.abstraction';
import { ErrorRecoveryStrategy } from '@app/logger/abstractions/error-recovery.abstraction';
import { PinoFactory } from './implementations/pino/pino-factory';
import { DefaultPipeline } from './implementations/pipeline/default-pipeline';
import { DefaultErrorRecovery } from './implementations/error-recovery/default-error-recovery';
import { BufferManagerService } from './services/buffer-manager.service';
import { LoggerService } from '@app/logger/logger.service';
import { LoggerFallbackService } from './services/logger-fallback.service';
import { InfrastructureModule } from '@app/infrastructure/infrastructure.module';
import { ConfigLibModule } from '@app/config-lib/config-lib.module';
import { globalConfigLoaderPipeline } from '@app/contracts/config-loader-pipeline.global';
import {
  LoggerFactory,
  LoggerInstance,
} from '@app/logger/abstractions/logger.abstraction';

export interface LoggerModuleOptions {
  config: LoggerConfig;
  loggerFactory?: LoggerFactory;
  pipeline?: LoggerPipeline;
  errorRecoveryStrategy?: ErrorRecoveryStrategy;
}

@Module({})
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class LoggerModule {
  static forRoot(options: LoggerModuleOptions): DynamicModule {
    const innerLoggerProvider: Provider = {
      provide: LoggerInstance,
      useFactory: () => {
        const factory = options.loggerFactory || new PinoFactory();
        return factory.createLogger(options.config);
      },
    };

    const pipelineProvider: Provider = {
      provide: LoggerPipeline,
      useFactory: () => options.pipeline || new DefaultPipeline(),
    };

    const errorRecoveryProvider: Provider = {
      provide: ErrorRecoveryStrategy,
      useFactory: () =>
        options.errorRecoveryStrategy || new DefaultErrorRecovery(),
    };

    const providers: Provider[] = [
      innerLoggerProvider,
      pipelineProvider,
      errorRecoveryProvider,

      BufferManagerService,
      LoggerFallbackService,

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

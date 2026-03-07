import { Module, DynamicModule, Provider, forwardRef } from '@nestjs/common';
import { LoggerConfig } from './interfaces/logger-config.interface';
import { LoggerFactoryBase } from './interfaces/logger-factory.interface';
import { PipelineBase } from './interfaces/pipeline.interface';
import { ErrorRecoveryStrategyBase } from './interfaces/error-recovery.interface';
import { PinoFactory } from './implementations/pino/pino-factory';
import { DefaultPipeline } from './implementations/pipeline/default-pipeline';
import { DefaultErrorRecovery } from './implementations/error-recovery/default-error-recovery';
import { LoggerCoreService } from './services/logger-core.service';
import { BufferManagerService } from './services/buffer-manager.service';
import { PipelineManagerService } from './services/pipeline-manager.service';
import { LoggerService } from '@app/logger/logger.service';
import { InfrastructureModule } from '@app/infrastructure/infrastructure.module';
import { ConfigLibModule } from '@app/config-lib/config-lib.module';
import { globalConfigLoaderPipeline } from '@app/contracts/config-loader-pipeline.global';

export interface LoggerModuleOptions {
  config: LoggerConfig;
  loggerFactory?: LoggerFactoryBase;
  pipeline?: PipelineBase;
  errorRecoveryStrategy?: ErrorRecoveryStrategyBase;
}

@Module({})
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class LoggerModule {
  static forRoot(options: LoggerModuleOptions): DynamicModule {
    const factoryProvider: Provider = {
      provide: LoggerFactoryBase,
      useFactory: () => options.loggerFactory || new PinoFactory(),
    };

    const pipelineProvider: Provider = {
      provide: PipelineBase,
      useFactory: () => options.pipeline || new DefaultPipeline(),
    };

    const errorRecoveryProvider: Provider = {
      provide: ErrorRecoveryStrategyBase,
      useFactory: () =>
        options.errorRecoveryStrategy || new DefaultErrorRecovery(),
    };

    const providers: Provider[] = [
      factoryProvider,
      pipelineProvider,
      errorRecoveryProvider,

      LoggerCoreService,
      BufferManagerService,
      PipelineManagerService,

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
      exports: [LoggerService, LoggerCoreService],
    };
  }
}

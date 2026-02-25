import {
  Module,
  DynamicModule,
  Provider,
  OptionalFactoryDependency,
  InjectionToken,
  Type,
  ForwardReference,
} from '@nestjs/common';
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
      providers,
      exports: [LoggerService, LoggerCoreService],
    };
  }

  static forRootAsync(options: {
    imports?: (
      | DynamicModule
      | Type
      | ForwardReference
      | Promise<DynamicModule>
    )[];
    useFactory: (
      ...args: (InjectionToken | OptionalFactoryDependency)[]
    ) => Promise<LoggerModuleOptions> | LoggerModuleOptions;
    inject?: (InjectionToken | OptionalFactoryDependency)[];
  }): DynamicModule {
    const configProvider: Provider = {
      provide: 'LOGGER_CONFIG',
      useFactory: (optionsResult: LoggerModuleOptions) => optionsResult.config,
      inject: ['LOGGER_MODULE_OPTIONS'],
    };

    const factoryProvider: Provider = {
      provide: LoggerFactoryBase,
      useFactory: (optionsResult: LoggerModuleOptions) =>
        optionsResult.loggerFactory || new PinoFactory(),
      inject: ['LOGGER_MODULE_OPTIONS'],
    };

    const pipelineProvider: Provider = {
      provide: PipelineBase,
      useFactory: (optionsResult: LoggerModuleOptions) =>
        optionsResult.pipeline || new DefaultPipeline(),
      inject: ['LOGGER_MODULE_OPTIONS'],
    };

    const errorRecoveryProvider: Provider = {
      provide: ErrorRecoveryStrategyBase,
      useFactory: (optionsResult: LoggerModuleOptions) =>
        optionsResult.errorRecoveryStrategy || new DefaultErrorRecovery(),
      inject: ['LOGGER_MODULE_OPTIONS'],
    };

    const optionsProvider: Provider = {
      provide: 'LOGGER_MODULE_OPTIONS',
      useFactory: options.useFactory,
      inject: options.inject || [],
    };

    const providers: Provider[] = [
      optionsProvider,
      configProvider,
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
      imports: options.imports || [],
      providers,
      exports: [LoggerService, LoggerCoreService],
    };
  }
}

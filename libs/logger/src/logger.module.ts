import {
  Module,
  DynamicModule,
  Provider,
  OptionalFactoryDependency,
  InjectionToken,
  Type,
  ForwardReference,
} from '@nestjs/common';
import { LOGGER_CONFIG_TOKEN, LoggerService } from './logger.service';
import { LoggerFactory } from './interfaces/logger-factory.interface';
import { PinoLoggerFactory } from './factories/pino-logger.factory';
import { LogPipeline } from './interfaces/log-pipeline.interface';
import { ErrorRecoveryStrategy } from './interfaces/error-recovery.interface';
import { LogPipelineService } from './pipeline/log-pipeline.service';
import { DefaultErrorRecoveryStrategy } from './error-recovery/default-error-recovery-strategy.service';
import type { LoggerConfig } from './interfaces/logger-config.interface';

export interface LoggerModuleOptions {
  config: LoggerConfig;
  loggerFactory?: LoggerFactory;
  logPipeline?: LogPipeline;
  errorRecoveryStrategy?: ErrorRecoveryStrategy;
}

@Module({})
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class LoggerModule {
  static forRoot(options: LoggerModuleOptions): DynamicModule {
    const configProvider: Provider = {
      provide: LOGGER_CONFIG_TOKEN,
      useValue: options.config,
    };

    const factoryProvider: Provider = {
      provide: LoggerFactory,
      useFactory: () => options.loggerFactory || new PinoLoggerFactory(),
    };

    const providers: Provider[] = [
      configProvider,
      factoryProvider,
      LoggerService,
    ];

    if (options.logPipeline) {
      providers.push({
        provide: LogPipeline,
        useValue: options.logPipeline,
      });
    } else {
      providers.push(LogPipelineService);
    }

    if (options.errorRecoveryStrategy) {
      providers.push({
        provide: ErrorRecoveryStrategy,
        useValue: options.errorRecoveryStrategy,
      });
    } else {
      providers.push(DefaultErrorRecoveryStrategy);
    }

    return {
      module: LoggerModule,
      providers,
      exports: [LoggerService],
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
      provide: LOGGER_CONFIG_TOKEN,
      useFactory: (optionsResult: LoggerModuleOptions) => optionsResult.config,
      inject: ['LOGGER_MODULE_OPTIONS'],
    };

    const factoryProvider: Provider = {
      provide: LoggerFactory,
      useFactory: (optionsResult: LoggerModuleOptions) =>
        optionsResult.loggerFactory || new PinoLoggerFactory(),
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
      LoggerService,
    ];

    providers.push({
      provide: LogPipeline,
      useFactory: (optionsResult: LoggerModuleOptions) =>
        optionsResult.logPipeline || new LogPipelineService(),
      inject: ['LOGGER_MODULE_OPTIONS'],
    });

    providers.push({
      provide: ErrorRecoveryStrategy,
      useFactory: (optionsResult: LoggerModuleOptions) =>
        optionsResult.errorRecoveryStrategy ||
        new DefaultErrorRecoveryStrategy(),
      inject: ['LOGGER_MODULE_OPTIONS'],
    });

    return {
      module: LoggerModule,
      imports: options.imports || [],
      providers,
      exports: [LoggerService],
    };
  }
}

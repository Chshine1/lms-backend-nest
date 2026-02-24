import {
  Module,
  DynamicModule,
  Provider,
  OptionalFactoryDependency,
  InjectionToken,
  Type,
  ForwardReference,
} from '@nestjs/common';
import { LOGGER_CONFIG, LoggerService } from './logger.service';
import type { LoggerConfig } from './interfaces/logger-config.interface';

@Module({})
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class LoggerModule {
  static forRoot(config: LoggerConfig): DynamicModule {
    const configProvider: Provider = {
      provide: LOGGER_CONFIG,
      useValue: config,
    };
    return {
      module: LoggerModule,
      providers: [configProvider, LoggerService],
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
    ) => Promise<LoggerConfig> | LoggerConfig;
    inject?: (InjectionToken | OptionalFactoryDependency)[];
  }): DynamicModule {
    const configProvider: Provider = {
      provide: LOGGER_CONFIG,
      useFactory: options.useFactory,
      inject: options.inject || [],
    };
    return {
      module: LoggerModule,
      imports: options.imports || [],
      providers: [configProvider, LoggerService],
      exports: [LoggerService],
    };
  }
}

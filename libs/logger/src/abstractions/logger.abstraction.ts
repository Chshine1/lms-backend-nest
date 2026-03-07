import { LoggerConfig } from '@app/logger/abstractions/logger-config.interface';
import { LogLevel } from '@app/logger/abstractions/log-entry.interface';

export abstract class LoggerFactory {
  abstract createLogger(config: LoggerConfig): LoggerInstance;
}

export abstract class LoggerInstance {
  abstract logWithLevel(
    level: LogLevel,
    message: string,
    metadata: Record<string, unknown>,
  ): void;

  abstract child(metadata: Record<string, unknown>): LoggerInstance;
}

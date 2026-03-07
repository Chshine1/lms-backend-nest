import {
  LogEntry,
  LogLevel,
} from '@app/logger/core/contracts/log-entry.interface';
import { LoggerConfig } from '@app/logger/core/contracts/logger-config.interface';

export abstract class LoggerFactory {
  abstract createLogger(config: LoggerConfig): LoggerInstance;
}

export abstract class LoggerInstance {
  abstract log(logEntry: LogEntry): Promise<void>;
  abstract child(metadata: Record<string, unknown>): LoggerInstance;

  logWithLevel(
    level: LogLevel,
    message: string,
    metadata: Record<string, unknown> = {},
  ): Promise<void> {
    const logEntry: LogEntry = {
      level,
      message,
      timestamp: new Date(),
      metadata,
    };
    return this.log(logEntry);
  }
}

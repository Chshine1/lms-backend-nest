import { LoggerInstance } from '@app/logger/core/contracts/logger.abstraction';
import { type Logger as PinoLogger } from 'pino';
import {
  LogEntry,
  LogLevel,
} from '@app/logger/core/contracts/log-entry.interface';

export class PinoLoggerInstance extends LoggerInstance {
  constructor(private readonly pinoInstance: PinoLogger) {
    super();
  }

  override log(logEntry: LogEntry): Promise<void> {
    const method = this.getPinoMethod(logEntry.level);
    method(logEntry.metadata, logEntry.message);
    return Promise.resolve();
  }

  override child(metadata: Record<string, unknown>): PinoLoggerInstance {
    const childPino = this.pinoInstance.child(metadata);
    return new PinoLoggerInstance(childPino);
  }

  private getPinoMethod(level: LogLevel): (...args: unknown[]) => void {
    switch (level) {
      case LogLevel.fatal:
        return this.pinoInstance.fatal.bind(this.pinoInstance);
      case LogLevel.error:
        return this.pinoInstance.error.bind(this.pinoInstance);
      case LogLevel.warn:
        return this.pinoInstance.warn.bind(this.pinoInstance);
      case LogLevel.info:
        return this.pinoInstance.info.bind(this.pinoInstance);
      case LogLevel.debug:
        return this.pinoInstance.debug.bind(this.pinoInstance);
      case LogLevel.trace:
        return this.pinoInstance.trace.bind(this.pinoInstance);
      default:
        return this.pinoInstance.info.bind(this.pinoInstance);
    }
  }
}

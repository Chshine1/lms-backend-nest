import { Injectable } from '@nestjs/common';
import { LoggerInstance } from '@app/logger/abstractions/logger.abstraction';
import { type Logger as PinoLogger } from 'pino';
import { LogLevel } from '@app/logger/abstractions/log-entry.interface';

@Injectable()
export class PinoLoggerInstance extends LoggerInstance {
  constructor(private readonly pinoInstance: PinoLogger) {
    super();
  }

  child(metadata: Record<string, unknown>): PinoLoggerInstance {
    const childPino = this.pinoInstance.child(metadata);
    return new PinoLoggerInstance(childPino);
  }

  logWithLevel(
    level: LogLevel,
    message: string,
    metadata: Record<string, unknown>,
  ): void {
    const logMethod = this.getPinoLogMethod(level);
    logMethod({ event: message, ...metadata }, `Event: ${message}`);
  }

  private getPinoLogMethod(level: LogLevel): (...args: unknown[]) => void {
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

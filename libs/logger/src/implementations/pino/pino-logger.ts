import { Injectable } from '@nestjs/common';
import { LoggerInstance } from '../../interfaces/logger.interface';
import { LogLevel } from '@app/contracts/config/logger-lib.config';
import { type Logger as PinoLoggerBase } from 'pino';

@Injectable()
export class PinoLogger extends LoggerInstance {
  constructor(private readonly pinoInstance: PinoLoggerBase) {
    super();
  }

  child(metadata: Record<string, unknown>): PinoLogger {
    const childPino = this.pinoInstance.child(metadata);
    return new PinoLogger(childPino);
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

import { Injectable } from '@nestjs/common';
import { LoggerBase } from '../../interfaces/logger.interface';
import { LogLevel } from '@app/contracts/config/logger-lib.config';
import { type Logger as PinoLoggerBase } from 'pino';

@Injectable()
export class PinoLogger extends LoggerBase {
  constructor(private readonly pinoInstance: PinoLoggerBase) {
    super();
  }

  fatal(message: string, metadata?: Record<string, unknown>): void {
    this.pinoInstance.fatal(metadata, message);
  }

  error(message: string, metadata?: Record<string, unknown>): void {
    this.pinoInstance.error(metadata, message);
  }

  warn(message: string, metadata?: Record<string, unknown>): void {
    this.pinoInstance.warn(metadata, message);
  }

  info(message: string, metadata?: Record<string, unknown>): void {
    this.pinoInstance.info(metadata, message);
  }

  debug(message: string, metadata?: Record<string, unknown>): void {
    this.pinoInstance.debug(metadata, message);
  }

  trace(message: string, metadata?: Record<string, unknown>): void {
    this.pinoInstance.trace(metadata, message);
  }

  child(metadata: Record<string, unknown>): PinoLogger {
    const childPino = this.pinoInstance.child(metadata);
    return new PinoLogger(childPino);
  }

  logEvent(event: string, metadata: Record<string, unknown>): void {
    this.pinoInstance.info({ event, ...metadata }, `Event: ${event}`);
  }

  logEventWithLevel(
    level: LogLevel,
    event: string,
    metadata: Record<string, unknown>,
  ): void {
    const logMethod = this.getPinoLogMethod(level);
    logMethod({ event, ...metadata }, `Event: ${event}`);
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

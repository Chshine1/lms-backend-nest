import { Injectable, Inject } from '@nestjs/common';
import { LoggerBase } from '../interfaces/logger.interface';
import { LoggerFactoryBase } from '../interfaces/logger-factory.interface';
import type { LoggerConfig } from '../interfaces/logger-config.interface';
import {
  LoggerError,
  LoggerErrorCode,
} from '../interfaces/error-recovery.interface';

@Injectable()
export class LoggerCoreService extends LoggerBase {
  private readonly currentLogger: LoggerBase;

  constructor(
    @Inject('LOGGER_CONFIG') private readonly config: LoggerConfig,
    @Inject(LoggerFactoryBase)
    private readonly loggerFactory: LoggerFactoryBase,
  ) {
    super();
    this.currentLogger = this.createLogger();
  }

  private createLogger(): LoggerBase {
    try {
      return this.loggerFactory.createLogger(this.config) as LoggerBase;
    } catch (error) {
      throw new LoggerError(
        'Failed to create logger instance',
        LoggerErrorCode.FACTORY_CREATION_FAILED,
        { config: this.config },
        error instanceof Error ? error : new Error(String(error)),
      );
    }
  }

  fatal(message: string, metadata?: Record<string, unknown>): void {
    this.currentLogger.fatal(message, metadata);
  }

  error(message: string, metadata?: Record<string, unknown>): void {
    this.currentLogger.error(message, metadata);
  }

  warn(message: string, metadata?: Record<string, unknown>): void {
    this.currentLogger.warn(message, metadata);
  }

  info(message: string, metadata?: Record<string, unknown>): void {
    this.currentLogger.info(message, metadata);
  }

  debug(message: string, metadata?: Record<string, unknown>): void {
    this.currentLogger.debug(message, metadata);
  }

  trace(message: string, metadata?: Record<string, unknown>): void {
    this.currentLogger.trace(message, metadata);
  }

  child(_metadata: Record<string, unknown>): LoggerBase {
    return this;
  }

  getInternalLogger(): LoggerBase {
    return this.currentLogger;
  }
}

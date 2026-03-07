import { Injectable, Inject } from '@nestjs/common';
import { EventLoggerBase } from '../interfaces/logger.interface';
import { LoggerFactoryBase } from '../interfaces/logger-factory.interface';
import type { LoggerConfig } from '../interfaces/logger-config.interface';
import {
  LoggerError,
  LoggerErrorCode,
} from '../interfaces/error-recovery.interface';
import { LogLevel } from '@app/contracts/src/config/logger-lib.config';

@Injectable()
export class LoggerCoreService extends EventLoggerBase {
  private readonly currentLogger: EventLoggerBase;

  constructor(
    @Inject('LOGGER_CONFIG') private readonly config: LoggerConfig,
    @Inject(LoggerFactoryBase)
    private readonly loggerFactory: LoggerFactoryBase,
  ) {
    super();
    this.currentLogger = this.createLogger();
  }

  private createLogger(): EventLoggerBase {
    try {
      return this.loggerFactory.createLogger(this.config) as EventLoggerBase;
    } catch (error) {
      throw new LoggerError(
        'Failed to create logger instance',
        LoggerErrorCode.FACTORY_CREATION_FAILED,
        { config: this.config },
        error instanceof Error ? error : new Error(String(error)),
      );
    }
  }

  override child(_metadata: Record<string, unknown>): EventLoggerBase {
    return this;
  }

  override logWithLevel(
    level: LogLevel,
    event: string,
    metadata: Record<string, unknown>,
  ): void {
    this.currentLogger.logWithLevel(level, event, metadata);
  }
}

import { Inject, Injectable, Optional } from '@nestjs/common';
import type { LoggerFactory } from './interfaces/logger-factory.interface';
import type {
  LogPipeline,
  LogEntry,
} from './interfaces/log-pipeline.interface';
import {
  type ErrorRecoveryStrategy,
  LoggerError,
  LoggerErrorCode,
} from './interfaces/error-recovery.interface';
import type { LoggerConfig } from '@app/logger/interfaces/logger-config.interface';
import type { Logger } from '@app/logger/interfaces/logger.interface';
import { LogLevel } from '@app/contracts/config/logger-lib.config';

export const LOGGER_CONFIG_TOKEN = Symbol('LOGGER_CONFIG');

@Injectable()
export class LoggerService implements Logger {
  private currentLogger: Logger;
  private buffer: Array<LogEntry> = [];
  private isBootstrapping: boolean;
  private readonly maxBufferSize = 1000;

  constructor(
    @Inject(LOGGER_CONFIG_TOKEN) config: LoggerConfig,
    private readonly loggerFactory: LoggerFactory,
    @Optional() private readonly logPipeline?: LogPipeline,
    @Optional() private readonly errorRecoveryStrategy?: ErrorRecoveryStrategy,
  ) {
    this.isBootstrapping = config.bootstrap;
    this.currentLogger = this.createLoggerWithErrorHandling(config);
  }

  private createLoggerWithErrorHandling(config: LoggerConfig): Logger {
    try {
      return this.loggerFactory.createLogger(config);
    } catch (e: unknown) {
      const error = e instanceof Error ? e : new Error(String(e));
      if (this.errorRecoveryStrategy?.canRecover(error)) {
        return this.createFallbackLogger();
      }
      throw new LoggerError(
        'Failed to create logger',
        LoggerErrorCode.FACTORY_CREATION_FAILED,
        { config },
      );
    }
  }

  private createFallbackLogger(): Logger {
    return {
      fatal: (message: string, ...args: unknown[]): void => {
        console.error(`[FALLBACK] [FATAL] ${message}`, ...args);
      },
      error: (message: string, ...args: unknown[]): void => {
        console.error(`[FALLBACK] [ERROR] ${message}`, ...args);
      },
      warn: (message: string, ...args: unknown[]): void => {
        console.warn(`[FALLBACK] [WARN] ${message}`, ...args);
      },
      info: (message: string, ...args: unknown[]): void => {
        console.info(`[FALLBACK] [INFO] ${message}`, ...args);
      },
      debug: (message: string, ...args: unknown[]): void => {
        console.debug(`[FALLBACK] [DEBUG] ${message}`, ...args);
      },
      trace: (message: string, ...args: unknown[]): void => {
        console.trace(`[FALLBACK] [TRACE] ${message}`, ...args);
      },

      logEvent: (event: string, metadata: Record<string, unknown>): void => {
        console.info(`[FALLBACK] [EVENT] ${event}`, metadata);
      },

      logEventWithLevel: (
        level: LogLevel,
        event: string,
        metadata: Record<string, unknown>,
      ): void => {
        console.log(
          `[FALLBACK] [${level.toUpperCase()}] [EVENT] ${event}`,
          metadata,
        );
      },

      child: () => this.createFallbackLogger(),
    };
  }

  updateConfig(newConfig: LoggerConfig): void {
    try {
      const newLogger = this.createLoggerWithErrorHandling(newConfig);

      if (this.isBootstrapping && this.buffer.length > 0) {
        this.replayBufferedLogs(newLogger);
      }

      this.currentLogger = newLogger;
      this.isBootstrapping = false;
    } catch (error) {
      if (this.errorRecoveryStrategy) {
        const dummyLogEntry: LogEntry = {
          event: 'config_update_failed',
          level: LogLevel.error,
          timestamp: new Date(),
          message: 'Failed to update logger configuration',
          metadata: {
            error: error instanceof Error ? error.message : String(error),
          },
        };
        this.errorRecoveryStrategy
          .onLoggerError(
            error instanceof Error ? error : new Error(String(error)),
            dummyLogEntry,
          )
          .catch(() => {});
        // TODO: Error handling here
      }
      throw error;
    }
  }

  private replayBufferedLogs(logger: Logger): void {
    for (const logEntry of this.buffer) {
      try {
        logger.logEventWithLevel(
          logEntry.level,
          logEntry.event,
          logEntry.metadata,
        );
      } catch (error) {
        console.error('Failed to replay buffered log:', logEntry, error);
      }
    }
    this.buffer = [];
  }

  private addToBuffer(
    level: LogLevel,
    message: string,
    metadata?: Record<string, unknown>,
  ): void {
    if (this.buffer.length >= this.maxBufferSize) {
      this.buffer.shift();
    }

    this.buffer.push({
      event: 'buffered_log',
      level,
      timestamp: new Date(),
      message,
      metadata: { ...metadata, originalMessage: message },
    });
  }

  private async processLogThroughPipeline(logEntry: LogEntry): Promise<void> {
    if (this.logPipeline) {
      try {
        await this.logPipeline.process(logEntry);
      } catch (error) {
        if (this.errorRecoveryStrategy) {
          await this.errorRecoveryStrategy.onLoggerError(
            error instanceof Error ? error : new Error(String(error)),
            logEntry,
          );
        }
      }
    }
  }

  fatal(message: string, ...args: unknown[]): void {
    this.currentLogger.fatal(message, ...args);
    if (this.isBootstrapping) {
      this.addToBuffer(LogLevel.fatal, message, { args });
    }
  }

  error(message: string, ...args: unknown[]): void {
    this.currentLogger.error(message, ...args);
    if (this.isBootstrapping) {
      this.addToBuffer(LogLevel.error, message, { args });
    }
  }

  warn(message: string, ...args: unknown[]): void {
    this.currentLogger.warn(message, ...args);
    if (this.isBootstrapping) {
      this.addToBuffer(LogLevel.warn, message, { args });
    }
  }

  info(message: string, ...args: unknown[]): void {
    this.currentLogger.info(message, ...args);
    if (this.isBootstrapping) {
      this.addToBuffer(LogLevel.info, message, { args });
    }
  }

  debug(message: string, ...args: unknown[]): void {
    this.currentLogger.debug(message, ...args);
    if (this.isBootstrapping) {
      this.addToBuffer(LogLevel.debug, message, { args });
    }
  }

  trace(message: string, ...args: unknown[]): void {
    this.currentLogger.trace(message, ...args);
    if (this.isBootstrapping) {
      this.addToBuffer(LogLevel.trace, message, { args });
    }
  }

  logEvent(event: string, metadata: Record<string, unknown>): void {
    this.currentLogger.logEvent(event, metadata);
    if (this.isBootstrapping) {
      this.addToBuffer(LogLevel.info, event, metadata);
    }

    const logEntry: LogEntry = {
      event,
      level: LogLevel.info,
      timestamp: new Date(),
      message: `Event: ${event}`,
      metadata,
    };
    this.processLogThroughPipeline(logEntry).catch(() => {});
    // TODO
  }

  logEventWithLevel(
    level: LogLevel,
    event: string,
    metadata: Record<string, unknown>,
  ): void {
    this.currentLogger.logEventWithLevel(level, event, metadata);
    if (this.isBootstrapping) {
      this.addToBuffer(level, event, metadata);
    }

    const logEntry: LogEntry = {
      event,
      level,
      timestamp: new Date(),
      message: `Event: ${event}`,
      metadata,
    };
    this.processLogThroughPipeline(logEntry).catch(() => {});
    // TODO
  }

  child(fields: Record<string, unknown>): Logger {
    const childLogger = this.currentLogger.child(fields);

    return {
      fatal: (message: string, ...args: unknown[]): void => {
        childLogger.fatal(message, ...args);
      },
      error: (message: string, ...args: unknown[]): void => {
        childLogger.error(message, ...args);
      },
      warn: (message: string, ...args: unknown[]): void => {
        childLogger.warn(message, ...args);
      },
      info: (message: string, ...args: unknown[]): void => {
        childLogger.info(message, ...args);
      },
      debug: (message: string, ...args: unknown[]): void => {
        childLogger.debug(message, ...args);
      },
      trace: (message: string, ...args: unknown[]): void => {
        childLogger.trace(message, ...args);
      },
      logEvent: (event: string, metadata: Record<string, unknown>): void => {
        childLogger.logEvent(event, metadata);
      },
      logEventWithLevel: (
        level: LogLevel,
        event: string,
        metadata: Record<string, unknown>,
      ): void => {
        childLogger.logEventWithLevel(level, event, metadata);
      },
      child: (nestedFields: Record<string, unknown>) =>
        childLogger.child(nestedFields),
    };
  }
}

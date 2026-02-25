import { Injectable, Inject } from '@nestjs/common';
import { LogLevel } from '@app/contracts/config/logger-lib.config';
import { LoggerCoreService } from '@app/logger/services/logger-core.service';
import { LoggerBase } from '@app/logger/interfaces/logger.interface';
import type { LoggerConfig } from '@app/logger/interfaces/logger-config.interface';
import { BufferManagerService } from '@app/logger/services/buffer-manager.service';
import { PipelineManagerService } from '@app/logger/services/pipeline-manager.service';
import { LogEntry } from '@app/logger/interfaces/pipeline.interface';
import {
  LoggerError,
  LoggerErrorCode,
} from '@app/logger/interfaces/error-recovery.interface';

@Injectable()
export class LoggerService extends LoggerBase {
  private readonly isBootstrapping: boolean;

  constructor(
    @Inject('LOGGER_CONFIG') config: LoggerConfig,
    @Inject(LoggerCoreService) private readonly coreService: LoggerCoreService,
    @Inject(BufferManagerService)
    private readonly bufferService: BufferManagerService,
    @Inject(PipelineManagerService)
    private readonly pipelineService: PipelineManagerService,
  ) {
    super();
    this.isBootstrapping = config.bootstrap;
  }

  // Logger接口实现
  fatal(message: string, metadata?: Record<string, unknown>): void {
    this.logWithLevel(LogLevel.fatal, message, metadata);
  }

  error(message: string, metadata?: Record<string, unknown>): void {
    this.logWithLevel(LogLevel.error, message, metadata);
  }

  warn(message: string, metadata?: Record<string, unknown>): void {
    this.logWithLevel(LogLevel.warn, message, metadata);
  }

  info(message: string, metadata?: Record<string, unknown>): void {
    this.logWithLevel(LogLevel.info, message, metadata);
  }

  debug(message: string, metadata?: Record<string, unknown>): void {
    this.logWithLevel(LogLevel.debug, message, metadata);
  }

  trace(message: string, metadata?: Record<string, unknown>): void {
    this.logWithLevel(LogLevel.trace, message, metadata);
  }

  child(_metadata: Record<string, unknown>): this {
    return this;
  }

  logEvent(event: string, metadata: Record<string, unknown>): void {
    this.logEventWithLevel(LogLevel.info, event, metadata);
  }

  logEventWithLevel(
    level: LogLevel,
    event: string,
    metadata: Record<string, unknown>,
  ): void {
    const logEntry: LogEntry = {
      event,
      level,
      timestamp: new Date(),
      message: `Event: ${event}`,
      metadata,
    };

    this.processLogEntry(logEntry);
  }

  async flushBuffer(): Promise<void> {
    try {
      await this.bufferService.flush();
    } catch (error) {
      throw new LoggerError(
        'Failed to flush buffer',
        LoggerErrorCode.BUFFER_FLUSH_FAILED,
        undefined,
        error instanceof Error ? error : new Error(String(error)),
      );
    }
  }

  updateConfig(newConfig: Partial<LoggerConfig>): void {
    throw new LoggerError(
      'Config update not implemented yet',
      LoggerErrorCode.CONFIG_UPDATE_FAILED,
      { newConfig },
    );
  }

  private logWithLevel(
    level: LogLevel,
    message: string,
    metadata?: Record<string, unknown>,
  ): void {
    const logEntry: LogEntry = {
      event: 'log',
      level,
      timestamp: new Date(),
      message,
      metadata: metadata || {},
    };

    this.processLogEntry(logEntry);
  }

  private processLogEntry(logEntry: LogEntry): void {
    try {
      if (this.isBootstrapping) {
        this.bufferService.add(logEntry);
      } else {
        this.pipelineService
          .processLogEntry(logEntry)
          .catch((error: unknown) => {
            this.handlePipelineError(error, logEntry);
          });
      }
    } catch (error: unknown) {
      this.handleBufferError(error, logEntry);
    }
  }

  private handlePipelineError(error: unknown, logEntry: LogEntry): void {
    const e = error instanceof Error ? error : new Error(String(error));
    console.error('Pipeline processing failed:', e.message);

    try {
      this.bufferService.add(logEntry);
    } catch (bufferError) {
      console.error('Buffer also failed:', bufferError);
    }
  }

  private handleBufferError(error: unknown, logEntry: LogEntry): void {
    const e = error instanceof Error ? error : new Error(String(error));
    console.error('Buffer operation failed:', e.message);

    try {
      this.directLog(logEntry);
    } catch (directError) {
      console.error('Direct logging also failed:', directError);
    }
  }

  private directLog(logEntry: LogEntry): void {
    switch (logEntry.level) {
      case LogLevel.fatal:
        this.coreService.fatal(logEntry.message, logEntry.metadata);
        break;
      case LogLevel.error:
        this.coreService.error(logEntry.message, logEntry.metadata);
        break;
      case LogLevel.warn:
        this.coreService.warn(logEntry.message, logEntry.metadata);
        break;
      case LogLevel.info:
        this.coreService.info(logEntry.message, logEntry.metadata);
        break;
      case LogLevel.debug:
        this.coreService.debug(logEntry.message, logEntry.metadata);
        break;
      case LogLevel.trace:
        this.coreService.trace(logEntry.message, logEntry.metadata);
        break;
      default:
        this.coreService.info(logEntry.message, logEntry.metadata);
    }
  }
}

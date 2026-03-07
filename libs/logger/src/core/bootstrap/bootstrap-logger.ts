import { LoggerInstance } from '@app/logger/core/contracts/logger.abstraction';
import {
  LogEntry,
  LogLevel,
} from '@app/logger/core/contracts/log-entry.interface';
import { LoggerError, LoggerErrorCode } from '@app/logger/logger.error';
import { BufferService } from '@app/logger/core/services/buffer.service';

export class BootstrapLogger extends LoggerInstance {
  constructor(private readonly bufferService: BufferService) {
    super();
  }

  override async log(logEntry: LogEntry): Promise<void> {
    try {
      await this.bufferService.write(logEntry);
    } catch (error) {
      throw new LoggerError(
        'Bootstrap logger console output failed',
        LoggerErrorCode.FALLBACK_LOGGER_FAILED,
        { logEntry, error },
        error instanceof Error ? error : new Error(String(error)),
      );
    }
    const method = this.getConsoleMethod(logEntry.level);
    method(
      `[${logEntry.level.toUpperCase()}] ${logEntry.message}`,
      logEntry.metadata,
    );
  }

  private getConsoleMethod(level: LogLevel): typeof console.log {
    switch (level) {
      case LogLevel.fatal:
      case LogLevel.error:
        return console.error;
      case LogLevel.warn:
        return console.warn;
      case LogLevel.info:
        return console.info;
      case LogLevel.debug:
        return console.debug;
      case LogLevel.trace:
        return console.trace;
      default:
        return console.log;
    }
  }

  override child(): LoggerInstance {
    throw new Error('Method not implemented.');
  }
}

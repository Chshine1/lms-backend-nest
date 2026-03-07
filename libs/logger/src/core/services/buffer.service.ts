import { Inject, Injectable } from '@nestjs/common';
import { LogEntry } from '@app/logger/core/contracts/log-entry.interface';
import { type LoggerConfig } from '@app/logger/core/contracts/logger-config.interface';
import { LoggerError, LoggerErrorCode } from '@app/logger/logger.error';

@Injectable()
export class BufferService {
  private buffer: LogEntry[] = [];
  private readonly maxBufferSize: number;
  private readonly enabled: boolean;

  constructor(@Inject('LOGGER_CONFIG') config: LoggerConfig) {
    this.enabled = config.buffer?.enabled ?? true;
    this.maxBufferSize = config.buffer?.maxSize ?? 1000;
  }

  write(logEntry: LogEntry): Promise<void> {
    if (!this.enabled) {
      return Promise.resolve();
    }

    if (this.buffer.length >= this.maxBufferSize) {
      throw new LoggerError(
        'Buffer overflow',
        LoggerErrorCode.BUFFER_OVERFLOW,
        { currentSize: this.buffer.length, maxSize: this.maxBufferSize },
      );
    }

    this.buffer.push(logEntry);
    return Promise.resolve();
  }

  flush(): LogEntry[] {
    try {
      const entries = [...this.buffer];
      this.buffer = [];
      return entries;
    } catch (error) {
      throw new LoggerError(
        'Buffer flush operation failed',
        LoggerErrorCode.BUFFER_FLUSH_FAILED,
        { bufferSize: this.buffer.length, error },
        error instanceof Error ? error : new Error(String(error)),
      );
    }
  }
}

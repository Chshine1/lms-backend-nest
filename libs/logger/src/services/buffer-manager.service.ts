import { Injectable, Inject } from '@nestjs/common';
import { LogEntry } from '../interfaces/pipeline.interface';
import type { LoggerConfig } from '../interfaces/logger-config.interface';
import {
  LoggerError,
  LoggerErrorCode,
} from '../interfaces/error-recovery.interface';

@Injectable()
export class BufferManagerService {
  private buffer: LogEntry[] = [];
  private readonly maxBufferSize: number;
  private readonly enabled: boolean;

  constructor(@Inject('LOGGER_CONFIG') config: LoggerConfig) {
    this.enabled = config.buffer?.enabled ?? true;
    this.maxBufferSize = config.buffer?.maxSize ?? 1000;
  }

  add(logEntry: LogEntry): void {
    if (!this.enabled) {
      return;
    }

    if (this.isFull()) {
      throw new LoggerError(
        'Log buffer is full',
        LoggerErrorCode.BUFFER_OVERFLOW,
        { bufferSize: this.buffer.length, maxBufferSize: this.maxBufferSize },
      );
    }

    this.buffer.push(logEntry);
  }

  flush(): Promise<void> {
    if (!this.enabled || this.buffer.length === 0) {
      return Promise.resolve();
    }

    try {
      this.buffer = [];
      return Promise.resolve();
    } catch (error) {
      throw new LoggerError(
        'Failed to flush log buffer',
        LoggerErrorCode.BUFFER_FLUSH_FAILED,
        { bufferSize: this.buffer.length },
        error instanceof Error ? error : new Error(String(error)),
      );
    }
  }

  getSize(): number {
    return this.buffer.length;
  }

  isFull(): boolean {
    return this.buffer.length >= this.maxBufferSize;
  }

  clear(): void {
    this.buffer = [];
  }

  getBufferContents(): LogEntry[] {
    return [...this.buffer];
  }
}

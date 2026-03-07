import { Inject, Injectable } from '@nestjs/common';
import { LoggerFallbackService } from './logger-fallback.service';
import {
  LogEntry,
  LogLevel,
} from '@app/logger/abstractions/log-entry.interface';
import { LoggerError, LoggerErrorCode } from '@app/logger/logger.error';
import { type LoggerConfig } from '@app/logger/abstractions/logger-config.interface';

@Injectable()
export class BufferManagerService {
  private buffer: LogEntry[] = [];
  private readonly maxBufferSize: number;
  private readonly enabled: boolean;

  constructor(
    @Inject('LOGGER_CONFIG') config: LoggerConfig,
    private readonly loggerFallbackService: LoggerFallbackService,
  ) {
    this.enabled = config.buffer?.enabled ?? true;
    this.maxBufferSize = config.buffer?.maxSize ?? 1000;
  }

  add(logEntry: LogEntry): void {
    if (!this.enabled) {
      this.loggerFallbackService
        .logWithFallback({
          level: LogLevel.warn,
          message: 'Logger buffer was disabled in the config but still called.',
          timestamp: new Date(),
          metadata: {},
        })
        .catch((error: unknown) => {
          console.error('[Buffer Manager Error]', error);
        });
      return;
    }

    if (this.buffer.length >= this.maxBufferSize) {
      throw new LoggerError(
        'Log buffer is full',
        LoggerErrorCode.BUFFER_OVERFLOW,
        { bufferSize: this.buffer.length, maxBufferSize: this.maxBufferSize },
      );
    }

    this.buffer.push(logEntry);
  }

  async flush(): Promise<void> {
    if (!this.enabled || this.buffer.length === 0) {
      return;
    }

    const logsToFlush = [...this.buffer];
    this.buffer = [];

    for (const entry of logsToFlush) {
      try {
        await this.loggerFallbackService.logWithFallback(entry);
      } catch (error) {
        console.error('[Buffer Flush Error]', error);
      }
    }
  }
}

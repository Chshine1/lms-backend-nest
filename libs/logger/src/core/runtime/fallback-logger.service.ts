import { Injectable } from '@nestjs/common';
import { LoggerInstance } from '@app/logger/core/contracts/logger.abstraction';
import { LoggerError, LoggerErrorCode } from '@app/logger/logger.error';
import { type LogEntry } from '@app/logger/core/contracts/log-entry.interface';

@Injectable()
export class FallbackLoggerService {
  constructor(private readonly fallbackLoggers: LoggerInstance[]) {}

  async logByFallback(logEntry: LogEntry): Promise<void> {
    const fallbackErrors: unknown[] = [];
    for (const fallback of this.fallbackLoggers) {
      try {
        await fallback.log(logEntry);
        return;
      } catch (fallbackError) {
        fallbackErrors.push(fallbackError);
      }
    }
    throw new LoggerError(
      'All fallback loggers failed',
      LoggerErrorCode.ALL_FALLBACKS_FAILED,
      {
        fallbackErrors,
      },
    );
  }
}

import { Injectable } from '@nestjs/common';
import { ErrorRecoveryStrategyBase } from '@app/logger/abstractions/error-recovery.abstraction';
import { FallbackLogger } from '@app/logger/abstractions/error-recovery.abstraction';
import { LogEntry } from '@app/logger/abstractions/log-entry.interface';

@Injectable()
export class DefaultErrorRecovery extends ErrorRecoveryStrategyBase {
  private fallbackLogger: FallbackLogger;

  constructor() {
    super();
    this.fallbackLogger = this.createFallbackLogger();
  }

  onLoggerError(error: Error, logEntry: LogEntry): Promise<void> {
    if (this.canRecover(error)) {
      this.fallbackLogger.log(logEntry.message, logEntry.level, {
        ...logEntry.metadata,
        originalError: error.message,
      });
      return Promise.resolve();
    } else {
      throw error;
    }
  }

  canRecover(error: Error): boolean {
    const recoverableErrors = [
      'ECONNREFUSED',
      'ETIMEDOUT',
      'ENOTFOUND',
      'ENOENT',
    ];

    return recoverableErrors.some(
      (pattern) =>
        error.message.includes(pattern) || error.name.includes(pattern),
    );
  }

  private createFallbackLogger(): FallbackLogger {
    return {
      log: (
        message: string,
        level: string,
        metadata?: Record<string, unknown>,
      ): void => {
        const timestamp = new Date().toISOString();
        const metaStr = metadata ? ` ${JSON.stringify(metadata)}` : '';
        console.log(
          `[FALLBACK] [${timestamp}] [${level.toUpperCase()}] ${message}${metaStr}`,
        );
      },
    };
  }
}

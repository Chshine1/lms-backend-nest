import { Injectable } from '@nestjs/common';
import { ErrorRecoveryStrategy } from '@app/logger/abstractions/error-recovery.abstraction';
import { FallbackLogger } from '@app/logger/abstractions/error-recovery.abstraction';
import { LogEntry } from '@app/logger/abstractions/log-entry.interface';

@Injectable()
export class DefaultErrorRecovery extends ErrorRecoveryStrategy {
  private readonly fallbackLogger: FallbackLogger;
  private readonly recoverableErrorPatterns: string[] = [
    'ECONNREFUSED',
    'ETIMEDOUT',
    'ENOTFOUND',
    'ECONNRESET',
    'EPIPE',
  ];

  constructor() {
    super();
    this.fallbackLogger = this.createFallbackLogger();
  }

  recover(error: Error, logEntry: LogEntry): Promise<void> {
    if (!this.canRecover(error)) {
      throw error;
    }

    this.fallbackLogger.log(
      logEntry.message,
      logEntry.level,
      this.buildRecoveryMetadata(logEntry, error),
    );
    return Promise.resolve();
  }

  canRecover(error: Error): boolean {
    const errorMessage = error.message.toUpperCase();
    const errorName = error.name.toUpperCase();

    return this.recoverableErrorPatterns.some(
      (pattern) =>
        errorMessage.includes(pattern) || errorName.includes(pattern),
    );
  }

  private buildRecoveryMetadata(
    logEntry: LogEntry,
    originalError: Error,
  ): Record<string, unknown> {
    return {
      ...logEntry.metadata,
      recovery: {
        originalError: {
          message: originalError.message,
          name: originalError.name,
          stack: originalError.stack,
        },
        timestamp: new Date().toISOString(),
        fallbackUsed: true,
      },
    };
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

import { Injectable } from '@nestjs/common';
import {
  ErrorRecoveryStrategy,
  FallbackLogger,
} from '../interfaces/error-recovery.interface';
import { LogEntry } from '@app/logger/interfaces/log-pipeline.interface';

@Injectable()
export class DefaultErrorRecoveryStrategy extends ErrorRecoveryStrategy {
  private fallbackLogger: FallbackLogger;

  constructor() {
    super();
    this.fallbackLogger = this.createFallbackLogger();
  }

  override onLoggerError(error: Error, logEntry: LogEntry): Promise<void> {
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

  override canRecover(_error: Error): boolean {
    return false;
    // TODO
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

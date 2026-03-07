import { Inject, Injectable } from '@nestjs/common';
import { LoggerInstance } from '@app/logger/abstractions/logger.abstraction';
import { LogEntry } from '@app/logger/abstractions/log-entry.interface';
import { LoggerError, LoggerErrorCode } from '@app/logger/logger.error';
import { ErrorRecoveryStrategy } from '@app/logger/abstractions/error-recovery.abstraction';
import { LoggerPipeline } from '@app/logger/abstractions/logger-pipeline.abstraction';

@Injectable()
export class LoggerFallbackService {
  constructor(
    @Inject(LoggerPipeline) private readonly loggerPipeline: LoggerPipeline,
    private readonly innerLogger: LoggerInstance,
    private readonly errorRecoveryStrategy: ErrorRecoveryStrategy,
  ) {}

  async logWithFallback(logEntry: LogEntry): Promise<void> {
    try {
      await this.loggerPipeline.process(logEntry);
    } catch (pipelineError) {
      await this.handlePipelineError(pipelineError, logEntry);
    }
  }

  private async handlePipelineError(
    error: unknown,
    logEntry: LogEntry,
  ): Promise<void> {
    const loggerError = this.toLoggerError(
      error,
      LoggerErrorCode.LOG_PROCESSING_FAILED,
      { logEntry },
    );

    if (this.errorRecoveryStrategy.canRecover(loggerError)) {
      await this.errorRecoveryStrategy.recover(loggerError, logEntry);
      return;
    }

    try {
      this.innerLogger.logWithLevel(
        logEntry.level,
        logEntry.message,
        logEntry.metadata,
      );
    } catch (innerError) {
      const innerLoggerError = this.toLoggerError(
        innerError,
        LoggerErrorCode.FALLBACK_LOGGER_FAILED,
        { originalError: loggerError },
      );
      console.error(
        '[FATAL] Both loggerPipeline and inner logger failed.',
        innerLoggerError,
      );
      throw innerLoggerError;
    }
  }

  private toLoggerError(
    error: unknown,
    code: string,
    context?: Record<string, unknown>,
  ): LoggerError {
    if (error instanceof LoggerError) {
      return error;
    }
    if (error instanceof Error) {
      return new LoggerError(error.message, code, context, error);
    }
    return new LoggerError(String(error), code, context);
  }
}

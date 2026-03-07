import { Injectable } from '@nestjs/common';
import { PipelineManagerService } from './pipeline-manager.service';
import { LoggerInstance } from '@app/logger/abstractions/logger.abstraction';
import { LogEntry } from '@app/logger/abstractions/log-entry.interface';
import { LoggerError } from '@app/logger/logger.error';

@Injectable()
export class LoggerFallbackService {
  constructor(
    private readonly pipelineService: PipelineManagerService,
    private readonly innerLogger: LoggerInstance,
  ) {}

  async logWithFallback(logEntry: LogEntry): Promise<void> {
    try {
      await this.pipelineService.processLogEntry(logEntry);
    } catch (pipelineError) {
      this.tryInnerLogger(logEntry, pipelineError);
    }
  }

  private tryInnerLogger(logEntry: LogEntry, originalError: unknown): void {
    try {
      this.innerLogger.logWithLevel(
        logEntry.level,
        logEntry.message,
        logEntry.metadata,
      );
      console.error(
        '[Logger] Pipeline failed, used inner logger:',
        originalError,
      );
    } catch (innerError) {
      console.error('[FATAL] Both pipeline and inner logger failed.', {
        pipelineError: this.formatError(originalError),
        innerError: this.formatError(innerError),
        logEntry,
      });
    }
  }

  private formatError(error: unknown): Record<string, unknown> {
    if (error instanceof LoggerError) {
      return {
        message: error.message,
        code: error.code,
        context: error.context,
        stack: error.stack,
        innerError: error.innerError,
      };
    }
    if (error instanceof Error) {
      return { message: error.message, stack: error.stack };
    }
    return { message: String(error) };
  }
}

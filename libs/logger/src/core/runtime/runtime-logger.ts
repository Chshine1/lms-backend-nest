import { LoggerInstance } from '@app/logger/core/contracts/logger.abstraction';
import { type LogEntry } from '@app/logger/core/contracts/log-entry.interface';
import { BufferService } from '@app/logger/core/services/buffer.service';
import { LoggerPipeline } from '@app/logger/core/contracts/logger-pipeline.abstraction';
import { FallbackLoggerService } from '@app/logger/core/runtime/fallback-logger.service';
import { LoggerError, LoggerErrorCode } from '@app/logger/logger.error';
import { LoggerConfig } from '@app/logger/core/contracts/logger-config.interface';

export class RuntimeLogger extends LoggerInstance {
  constructor(
    _config: LoggerConfig,
    private readonly bufferService: BufferService,
    private readonly pipeline: LoggerPipeline,
    private readonly fallbackService: FallbackLoggerService,
  ) {
    super();
  }

  override async log(logEntry: LogEntry): Promise<void> {
    try {
      await this.bufferService.write(logEntry);
      return;
    } catch (bufferError) {
      try {
        await this.pipeline.process(logEntry);
        return;
      } catch (pipelineError) {
        try {
          await this.fallbackService.logByFallback(logEntry);
          return;
        } catch (fallbackError) {
          console.log(logEntry);
          throw new LoggerError(
            'All logging fallbacks failed',
            LoggerErrorCode.ALL_FALLBACKS_FAILED,
            {
              logEntry,
              bufferError,
              pipelineError,
              fallbackError,
            },
            fallbackError instanceof Error
              ? fallbackError
              : new Error(String(fallbackError)),
          );
        }
      }
    }
  }

  override child(_metadata: Record<string, unknown>): LoggerInstance {
    throw new Error('Method not implemented.');
  }
}

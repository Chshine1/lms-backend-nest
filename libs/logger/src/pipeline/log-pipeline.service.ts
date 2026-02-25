import { Injectable } from '@nestjs/common';
import {
  LogPipeline,
  LogProcessor,
  LogFilter,
  LogEntry,
} from '../interfaces/log-pipeline.interface';
import {
  LoggerError,
  LoggerErrorCode,
} from '../interfaces/error-recovery.interface';

@Injectable()
export class LogPipelineService extends LogPipeline {
  private processors: LogProcessor[] = [];
  private filters: LogFilter[] = [];

  override addProcessor(processor: LogProcessor): this {
    this.processors.push(processor);
    return this;
  }
  override addFilter(filter: LogFilter): this {
    this.filters.push(filter);
    return this;
  }

  override async process(logEntry: LogEntry): Promise<void> {
    try {
      for (const filter of this.filters) {
        if (!filter.shouldLog(logEntry)) {
          return;
        }
      }

      let processedEntry = logEntry;
      for (const processor of this.processors) {
        if (processor.canProcess(processedEntry)) {
          processedEntry = await processor.process(processedEntry);
        }
      }
    } catch (error) {
      throw new LoggerError(
        'Log processing failed',
        LoggerErrorCode.LOG_PROCESSING_FAILED,
        { logEntry },
        error instanceof Error ? error : new Error(String(error)),
      );
    }
  }
}

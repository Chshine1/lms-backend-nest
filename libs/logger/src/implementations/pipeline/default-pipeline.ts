import { Injectable } from '@nestjs/common';
import {
  LogFilter,
  LogProcessor,
  LoggerPipeline,
} from '@app/logger/abstractions/logger-pipeline.abstraction';
import { LogEntry } from '@app/logger/abstractions/log-entry.interface';
import { LoggerError, LoggerErrorCode } from '@app/logger/logger.error';

@Injectable()
export class DefaultPipeline extends LoggerPipeline {
  private processors: LogProcessor[] = [];
  private filters: LogFilter[] = [];

  async process(logEntry: LogEntry): Promise<void> {
    this.applyFilters(logEntry);
    const processedEntry = await this.applyProcessors(logEntry);
    await this.executePipeline(processedEntry);
  }

  private applyFilters(logEntry: LogEntry): void {
    for (const filter of this.filters) {
      if (!filter.shouldLog(logEntry)) {
        return;
      }
    }
  }

  private async applyProcessors(logEntry: LogEntry): Promise<LogEntry> {
    let processedEntry = logEntry;
    for (const processor of this.processors) {
      if (processor.canProcess(processedEntry)) {
        processedEntry = await processor.process(processedEntry);
      }
    }
    return processedEntry;
  }

  private async executePipeline(logEntry: LogEntry): Promise<void> {
    try {
      await this.doProcess(logEntry);
    } catch (error) {
      throw new LoggerError(
        'Log processing failed',
        LoggerErrorCode.LOG_PROCESSING_FAILED,
        { logEntry },
        error instanceof Error ? error : new Error(String(error)),
      );
    }
  }

  protected async doProcess(_logEntry: LogEntry): Promise<void> {}

  addProcessor(processor: LogProcessor): this {
    this.processors.push(processor);
    return this;
  }

  addFilter(filter: LogFilter): this {
    this.filters.push(filter);
    return this;
  }
}

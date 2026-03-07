import { Injectable } from '@nestjs/common';
import {
  LogFilter,
  LogProcessor,
  LoggerPipeline,
} from '@app/logger/core/contracts/logger-pipeline.abstraction';
import { LogEntry } from '@app/logger/core/contracts/log-entry.interface';
import { LoggerError, LoggerErrorCode } from '@app/logger/logger.error';

@Injectable()
export class DefaultPipeline extends LoggerPipeline {
  private processors: LogProcessor[] = [];
  private filters: LogFilter[] = [];

  async process(logEntry: LogEntry): Promise<void> {
    try {
      if (!this.shouldProcess(logEntry)) {
        return;
      }

      await this.applyProcessors(logEntry);
    } catch (error) {
      throw LoggerError.fromError(
        error,
        'Pipeline processing failed',
        LoggerErrorCode.LOG_PROCESSING_FAILED,
        { logEntry, error },
      );
    }
  }

  private shouldProcess(logEntry: LogEntry): boolean {
    let filterIndex = 0;
    for (const filter of this.filters) {
      try {
        if (!filter.shouldLog(logEntry)) {
          return false;
        }
      } catch (error) {
        throw LoggerError.fromError(
          error,
          `Filter chain broken at index ${filterIndex.toString()}`,
          LoggerErrorCode.PROCESSOR_CHAIN_BROKEN,
          {
            filterIndex,
            processorType: filter.constructor.name,
            logEntry,
            error,
          },
        );
      }
      filterIndex++;
    }
    return true;
  }

  private async applyProcessors(logEntry: LogEntry): Promise<LogEntry> {
    let processedEntry = logEntry;
    let processorIndex = 0;

    for (const processor of this.processors) {
      try {
        if (processor.canProcess(processedEntry)) {
          processedEntry = await processor.process(processedEntry);
        }
        processorIndex++;
      } catch (error) {
        throw LoggerError.fromError(
          error,
          `Processor chain broken at index ${processorIndex.toString()}`,
          LoggerErrorCode.PROCESSOR_CHAIN_BROKEN,
          {
            processorIndex,
            processorType: processor.constructor.name,
            logEntry,
            error,
          },
        );
      }
    }
    return processedEntry;
  }

  addProcessor(processor: LogProcessor): this {
    this.processors.push(processor);
    return this;
  }

  addFilter(filter: LogFilter): this {
    this.filters.push(filter);
    return this;
  }
}

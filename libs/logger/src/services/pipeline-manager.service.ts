import { Injectable, Inject } from '@nestjs/common';
import {
  LogFilter,
  LogProcessor,
  PipelineBase,
} from '@app/logger/abstractions/pipeline.abstraction';
import { LogEntry } from '@app/logger/abstractions/log-entry.interface';

@Injectable()
export class PipelineManagerService {
  constructor(@Inject(PipelineBase) private readonly pipeline: PipelineBase) {}

  async processLogEntry(logEntry: LogEntry): Promise<void> {
    return this.pipeline.process(logEntry);
  }

  addProcessor(processor: LogProcessor): this {
    this.pipeline.addProcessor(processor);
    return this;
  }

  addFilter(filter: LogFilter): this {
    this.pipeline.addFilter(filter);
    return this;
  }
}

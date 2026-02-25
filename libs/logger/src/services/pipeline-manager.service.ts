import { Injectable, Inject } from '@nestjs/common';
import {
  LogFilter,
  LogProcessor,
  PipelineBase,
} from '../interfaces/pipeline.interface';
import { LogEntry } from '../interfaces/pipeline.interface';

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

  getPipelineStatus(): { processorCount: number; filterCount: number } {
    return { processorCount: 0, filterCount: 0 };
  }
}

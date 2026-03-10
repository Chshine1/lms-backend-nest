import {
  Filter,
  Processor,
  Sink,
} from '@app/infrastructure/modules/logger/pipeline/middlewares.interface';
import { LogEntry } from '@app/infrastructure/modules/logger/contracts/log.entry';

export class PipelineSink implements Sink {
  constructor(
    private filters: Filter[],
    private processors: Processor[],
    private primary: Sink,
    private fallbacks: Sink[],
  ) {}

  async emit(entry: LogEntry): Promise<void> {
    let current = entry;

    for (const filter of this.filters) {
      if (!filter.filter(current)) return;
    }

    for (const processor of this.processors) {
      current = processor.process(current);
    }

    try {
      await this.primary.emit(current);
    } catch (error) {
      for (const fb of this.fallbacks) {
        try {
          await fb.emit(current);
          return;
        } catch {
          // 忽略单个回退失败，继续尝试下一个
        }
      }
      console.error('All sinks failed for log entry', current, error);
    }
  }
}

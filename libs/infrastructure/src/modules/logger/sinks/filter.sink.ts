import { LogEntry } from '../contracts/log.entry';
import { Filter, Sink } from '../contracts/middlewares.interface';
import { createLoggerSinkError } from '../errors/logger-sink.error';

export class FilterSink implements Sink {
  constructor(
    public readonly id: string,
    private filter: Filter,
    private next: Sink,
  ) {}

  async emit(entry: LogEntry): Promise<void> {
    try {
      if (this.filter.filter(entry)) {
        await this.next.emit(entry);
      }
    } catch (error: unknown) {
      throw createLoggerSinkError(
        {
          type: 'filter',
          id: this.id,
        },
        error,
      );
    }
  }
}

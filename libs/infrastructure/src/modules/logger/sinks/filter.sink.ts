import { LogEntry } from '@app/infrastructure/modules/logger/contracts/log.entry';
import {
  Filter,
  Sink,
} from '@app/infrastructure/modules/logger/contracts/middlewares.interface';
import { createLoggerSinkError } from '@app/infrastructure/modules/logger/errors/logger-sink.error';

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

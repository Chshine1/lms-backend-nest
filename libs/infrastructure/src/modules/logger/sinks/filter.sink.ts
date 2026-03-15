import { LogEntry } from '@app/infrastructure/modules/logger/contracts/log.entry';
import {
  Filter,
  Sink,
} from '@app/infrastructure/modules/logger/contracts/middlewares.interface';

export class FilterSink implements Sink {
  constructor(
    private filter: Filter,
    private next: Sink,
  ) {}

  async emit(entry: LogEntry): Promise<void> {
    if (this.filter.filter(entry)) {
      await this.next.emit(entry);
    }
  }
}

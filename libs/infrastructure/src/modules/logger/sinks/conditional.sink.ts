import { LogEntry } from '@app/infrastructure/modules/logger/contracts/log.entry';
import { Sink } from '@app/infrastructure/modules/logger/contracts/middlewares.interface';

export class ConditionalSink implements Sink {
  constructor(
    private predicate: (entry: LogEntry) => boolean,
    private trueSink: Sink,
    private falseSink: Sink,
  ) {}

  async emit(entry: LogEntry): Promise<void> {
    if (this.predicate(entry)) {
      await this.trueSink.emit(entry);
    } else {
      await this.falseSink.emit(entry);
    }
  }
}

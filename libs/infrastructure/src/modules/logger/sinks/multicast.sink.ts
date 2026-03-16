import { Sink } from '@app/infrastructure/modules/logger/contracts/middlewares.interface';
import { LogEntry } from '@app/infrastructure/modules/logger/contracts/log.entry';

export class MulticastSink implements Sink {
  constructor(private sinks: Sink[]) {}

  async emit(entry: LogEntry): Promise<void> {
    const promises = this.sinks.map((sink) => sink.emit(entry));
    await Promise.all(promises);
  }
}

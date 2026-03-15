import { Sink } from '@app/infrastructure/modules/logger/contracts/middlewares.interface';
import { LogEntry } from '@app/infrastructure/modules/logger/contracts/log.entry';

export class MulticastSink implements Sink {
  constructor(
    private sinks: Sink[],
    private options?: { continueOnError?: boolean },
  ) {}

  async emit(entry: LogEntry): Promise<void> {
    const promises = this.sinks.map((sink) =>
      sink.emit(entry).catch((err: unknown) => {
        if (!this.options?.continueOnError) throw err;
        console.error('Sink failed (ignored):', err);
      }),
    );
    await Promise.all(promises);
  }
}

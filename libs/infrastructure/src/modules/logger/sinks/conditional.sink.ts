import { LogEntry } from '@app/infrastructure/modules/logger/contracts/log.entry';
import { Sink } from '@app/infrastructure/modules/logger/contracts/middlewares.interface';
import { createLoggerSinkError } from '@app/infrastructure/modules/logger/errors/logger-sink.error';

export class ConditionalSink implements Sink {
  constructor(
    public readonly id: string,
    private predicate: (entry: LogEntry) => boolean,
    private trueSink: Sink,
    private falseSink: Sink,
  ) {}

  async emit(entry: LogEntry): Promise<void> {
    try {
      if (this.predicate(entry)) {
        await this.trueSink.emit(entry);
      } else {
        await this.falseSink.emit(entry);
      }
    } catch (error: unknown) {
      throw createLoggerSinkError(
        {
          type: 'conditional',
          id: this.id,
        },
        error,
      );
    }
  }
}

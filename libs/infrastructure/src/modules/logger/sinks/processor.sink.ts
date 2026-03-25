import { LogEntry } from '../contracts/log.entry';
import { Processor, Sink } from '../contracts/middlewares.interface';
import { createLoggerSinkError } from '../errors/logger-sink.error';

export class ProcessorSink implements Sink {
  constructor(
    public readonly id: string,
    private processor: Processor,
    private next: Sink,
  ) {}

  async emit(entry: LogEntry): Promise<void> {
    try {
      const processed = await this.processor.process(entry);
      await this.next.emit(processed);
    } catch (error: unknown) {
      throw createLoggerSinkError(
        {
          type: 'processor',
          id: this.id,
        },
        error,
      );
    }
  }
}

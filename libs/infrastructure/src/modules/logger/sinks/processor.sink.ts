import { LogEntry } from '@app/infrastructure/modules/logger/contracts/log.entry';
import {
  Processor,
  Sink,
} from '@app/infrastructure/modules/logger/contracts/middlewares.interface';

export class TransformSink implements Sink {
  constructor(
    private processor: Processor,
    private next: Sink,
  ) {}

  async emit(entry: LogEntry): Promise<void> {
    const processed = await this.processor.process(entry);
    await this.next.emit(processed);
  }
}

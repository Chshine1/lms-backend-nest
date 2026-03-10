import { Sink } from '@app/infrastructure/modules/logger/pipeline/middlewares.interface';
import { LogBuffer } from '@app/infrastructure/modules/logger/buffer/buffer.interface';
import { LogEntry } from '@app/infrastructure/modules/logger/contracts/log.entry';

export class LoggerService {
  private flushing = false;

  constructor(
    private readonly sink: Sink,
    private readonly buffer: LogBuffer,
  ) {}

  async log(entry: LogEntry): Promise<void> {
    const accepted = this.buffer.write(entry);
    if (!accepted) {
      await this.sink.emit(entry);
    }
  }

  async flush(): Promise<void> {
    if (this.flushing) return;
    this.flushing = true;
    try {
      await this.buffer.flush(this.sink);
    } finally {
      this.flushing = false;
    }
  }
}

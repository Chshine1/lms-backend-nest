import { Sink } from '@app/infrastructure/modules/logger/contracts/middlewares.interface';
import { LogEntry } from '@app/infrastructure/modules/logger/contracts/log.entry';

export class FailoverSink implements Sink {
  constructor(
    private primary: Sink,
    private fallbacks: Sink[],
  ) {}

  async emit(entry: LogEntry): Promise<void> {
    try {
      await this.primary.emit(entry);
    } catch {
      for (const fb of this.fallbacks) {
        try {
          await fb.emit(entry);
          return;
        } catch {
          // 继续尝试下一个
        }
      }
      throw new Error('All sinks failed for log entry');
    }
  }
}

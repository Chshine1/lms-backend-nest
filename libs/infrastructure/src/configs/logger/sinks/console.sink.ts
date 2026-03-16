import { LogEntry } from '@app/infrastructure/modules/logger/contracts/log.entry';
import { Sink } from '@app/infrastructure/modules/logger/contracts/middlewares.interface';

export class ConsoleSink implements Sink {
  constructor(public readonly id: string) {}

  emit(entry: LogEntry): Promise<void> {
    console.log(JSON.stringify(entry));
    return Promise.resolve();
  }
}

import { Sink } from '@app/infrastructure/modules/logger/pipeline/middlewares.interface';
import { LogEntry } from '@app/infrastructure/modules/logger/contracts/log.entry';

export class ConsoleSink implements Sink {
  emit(entry: LogEntry): Promise<void> {
    console.log(JSON.stringify(entry));
    return Promise.resolve();
  }
}

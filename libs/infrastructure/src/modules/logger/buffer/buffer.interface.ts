import { Sink } from '@app/infrastructure/modules/logger/pipeline/middlewares.interface';
import { LogEntry } from '@app/infrastructure/modules/logger/contracts/log.entry';

export interface LogBuffer {
  write(entry: LogEntry): boolean;
  flush(sink: Sink): Promise<void>;
  clear(): void;
  size(): number;
  getEntries(): LogEntry[];
}

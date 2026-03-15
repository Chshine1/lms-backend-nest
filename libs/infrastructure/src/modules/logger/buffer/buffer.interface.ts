import { LogEntry } from '@app/infrastructure/modules/logger/contracts/log.entry';
import { Sink } from '@app/infrastructure/modules/logger/contracts/middlewares.interface';

export interface LogBuffer {
  write(entry: LogEntry): boolean;
  flush(sink: Sink): Promise<void>;
  clear(): void;
  size(): number;
  getEntries(): LogEntry[];
}

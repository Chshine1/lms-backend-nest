import { LogEntry } from './log.entry';
import { Sink } from './middlewares.interface';

export interface LogBuffer {
  write(entry: LogEntry): boolean;
  flush(sink: Sink): Promise<void>;
}

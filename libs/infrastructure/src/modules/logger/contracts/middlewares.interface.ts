import { LogEntry } from '@app/infrastructure/modules/logger/contracts/log.entry';

export interface Sink {
  id: string;
  emit(entry: LogEntry): Promise<void>;
}

export interface Filter {
  filter(entry: LogEntry): boolean;
}

export interface Processor {
  process(entry: LogEntry): Promise<LogEntry>;
}

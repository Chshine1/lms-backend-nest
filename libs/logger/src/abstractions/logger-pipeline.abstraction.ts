import { LogEntry } from '@app/logger/abstractions/log-entry.interface';

export interface LogProcessor {
  process(logEntry: LogEntry): Promise<LogEntry>;
  canProcess(logEntry: LogEntry): boolean;
}

export interface LogFilter {
  shouldLog(logEntry: LogEntry): boolean;
}

export abstract class LoggerPipeline {
  abstract process(logEntry: LogEntry): Promise<void>;
  abstract addProcessor(processor: LogProcessor): this;
  abstract addFilter(filter: LogFilter): this;
}

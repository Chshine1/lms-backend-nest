import { LogLevel } from '@app/contracts/config/logger-lib.config';

export interface LogEntry<
  T extends Record<string, unknown> = Record<string, unknown>,
> {
  event: string;
  level: LogLevel;
  timestamp: Date;
  message: string;
  metadata: T;
  context?: Record<string, unknown>;
}

export interface LogProcessor {
  process(logEntry: LogEntry): Promise<LogEntry>;
  canProcess(logEntry: LogEntry): boolean;
}

export interface LogFilter {
  shouldLog(logEntry: LogEntry): boolean;
}

export interface Pipeline {
  process(logEntry: LogEntry): Promise<void>;
  addProcessor(processor: LogProcessor): this;
  addFilter(filter: LogFilter): this;
}

export abstract class PipelineBase implements Pipeline {
  abstract process(logEntry: LogEntry): Promise<void>;
  abstract addProcessor(processor: LogProcessor): this;
  abstract addFilter(filter: LogFilter): this;
}

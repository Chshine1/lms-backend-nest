export enum LogLevel {
  debug = 0,
  info = 1,
  warn = 2,
  error = 3,
  fatal = 4,
}

export interface LogEntry {
  timestamp: Date;
  level: LogLevel;
  message: string;
  context?: Record<string, unknown>;
  error?: Error;
  metadata: Record<string, unknown>;
}

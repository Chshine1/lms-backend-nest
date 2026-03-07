export enum LogLevel {
  fatal = 'fatal',
  error = 'error',
  warn = 'warn',
  info = 'info',
  debug = 'debug',
  trace = 'trace',
}

export interface LogEntry<
  T extends Record<string, unknown> = Record<string, unknown>,
> {
  level: LogLevel;
  timestamp: Date;
  message: string;
  metadata: T;
  context?: Record<string, unknown>;
}

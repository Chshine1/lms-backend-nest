export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
  FATAL = 'fatal',
}

export interface LogEntry {
  timestamp: Date;
  level: LogLevel;
  message: string;

  serviceName: string;
  hostname?: string;
  environment?: string;

  traceId?: string;
  spanId?: string;
  parentSpanId?: string;

  userId?: string;
  sessionId?: string;
  requestId?: string;

  context?: Record<string, unknown>;

  error?: {
    name: string;
    message: string;
    stack?: string;
    code?: string | number;
    cause?: unknown;
  };

  durationMs?: number;
  source?: {
    file: string;
    line: number;
    function?: string;
  };
}

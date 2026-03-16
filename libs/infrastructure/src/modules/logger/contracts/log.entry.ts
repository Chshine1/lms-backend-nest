import { BaseError } from '@app/contracts/errors/base-error';

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

  error?: BaseError;

  durationMs?: number;
  source?: {
    file: string;
    line: number;
    function?: string;
  };
}

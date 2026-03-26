import { BaseError, LogLevel } from '@app/contracts';

export interface LogEntry {
  timestamp: Date;
  level: LogLevel;
  message: string;

  serviceName: string;
  hostname?: string;
  environment?: string;

  traceId?: string | undefined;
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

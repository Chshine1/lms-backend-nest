import { LogLevel } from '@app/contracts/config/logger-lib.config';

export interface Logger {
  fatal(message: string, metadata?: Record<string, unknown>): void;
  error(message: string, metadata?: Record<string, unknown>): void;
  warn(message: string, metadata?: Record<string, unknown>): void;
  info(message: string, metadata?: Record<string, unknown>): void;
  debug(message: string, metadata?: Record<string, unknown>): void;
  trace(message: string, metadata?: Record<string, unknown>): void;

  child(metadata: Record<string, unknown>): Logger;
}

export interface EventLogger {
  logEvent(event: string, metadata: Record<string, unknown>): void;
  logEventWithLevel(
    level: LogLevel,
    event: string,
    metadata: Record<string, unknown>,
  ): void;
}

export abstract class LoggerBase implements Logger {
  abstract fatal(message: string, metadata?: Record<string, unknown>): void;
  abstract error(message: string, metadata?: Record<string, unknown>): void;
  abstract warn(message: string, metadata?: Record<string, unknown>): void;
  abstract info(message: string, metadata?: Record<string, unknown>): void;
  abstract debug(message: string, metadata?: Record<string, unknown>): void;
  abstract trace(message: string, metadata?: Record<string, unknown>): void;

  abstract child(metadata: Record<string, unknown>): Logger;
}

export abstract class EventLoggerBase implements EventLogger {
  abstract logEvent(event: string, metadata: Record<string, unknown>): void;
  abstract logEventWithLevel(
    level: LogLevel,
    event: string,
    metadata: Record<string, unknown>,
  ): void;
}

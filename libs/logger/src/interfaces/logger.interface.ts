import { LogLevel } from '@app/contracts/config/logger-lib.config';

export interface EventLogger {
  logWithLevel(
    level: LogLevel,
    message: string,
    metadata: Record<string, unknown>,
  ): void;
}

export abstract class EventLoggerBase implements EventLogger {
  abstract logWithLevel(
    level: LogLevel,
    message: string,
    metadata: Record<string, unknown>,
  ): void;

  abstract child(metadata: Record<string, unknown>): EventLogger;
}

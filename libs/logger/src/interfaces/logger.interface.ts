import { LogLevel } from '@app/contracts/config/logger-lib.config';

export interface Logger {
  fatal(message: string, ...args: unknown[]): void;
  error(message: string, ...args: unknown[]): void;
  warn(message: string, ...args: unknown[]): void;
  info(message: string, ...args: unknown[]): void;
  debug(message: string, ...args: unknown[]): void;
  trace(message: string, ...args: unknown[]): void;

  logEvent(event: string, metadata: Record<string, unknown>): void;
  logEventWithLevel(
    level: LogLevel,
    event: string,
    metadata: Record<string, unknown>,
  ): void;

  child(fields: Record<string, unknown>): Logger;
}

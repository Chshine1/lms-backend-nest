import { LogLevel } from '@app/contracts/config/logger-lib.config';

export abstract class LoggerInstance {
  abstract logWithLevel(
    level: LogLevel,
    message: string,
    metadata: Record<string, unknown>,
  ): void;

  abstract child(metadata: Record<string, unknown>): LoggerInstance;
}

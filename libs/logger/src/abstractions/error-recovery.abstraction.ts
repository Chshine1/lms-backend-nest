import { LogEntry } from '@app/logger/abstractions/log-entry.interface';

export abstract class ErrorRecoveryStrategyBase {
  abstract onLoggerError(error: Error, logEntry: LogEntry): Promise<void>;
  abstract canRecover(error: Error): boolean;
}

export interface FallbackLogger {
  log(message: string, level: string, metadata?: Record<string, unknown>): void;
}

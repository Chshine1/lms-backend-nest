import { LogEntry } from '@app/logger/abstractions/log-entry.interface';

export abstract class ErrorRecoveryStrategy {
  abstract recover(error: Error, logEntry: LogEntry): Promise<void>;
  abstract canRecover(error: Error): boolean;
}

export interface FallbackLogger {
  log(message: string, level: string, metadata?: Record<string, unknown>): void;
}

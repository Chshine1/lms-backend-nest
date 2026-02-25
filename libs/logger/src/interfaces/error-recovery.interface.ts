import { LogEntry } from './log-pipeline.interface';

export abstract class ErrorRecoveryStrategy {
  abstract onLoggerError(error: Error, logEntry: LogEntry): Promise<void>;
  abstract canRecover(error: Error): boolean;
}

export interface FallbackLogger {
  log(message: string, level: string, metadata?: Record<string, unknown>): void;
}

export class LoggerError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly context?: Record<string, unknown>,
    public readonly _cause?: Error,
  ) {
    super(message);
    this.name = 'LoggerError';
  }
}

export enum LoggerErrorCode {
  BUFFER_OVERFLOW = 'BUFFER_OVERFLOW',
  CONFIG_UPDATE_FAILED = 'CONFIG_UPDATE_FAILED',
  LOG_PROCESSING_FAILED = 'LOG_PROCESSING_FAILED',
  FACTORY_CREATION_FAILED = 'FACTORY_CREATION_FAILED',
}

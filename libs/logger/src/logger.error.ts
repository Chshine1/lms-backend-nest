export class LoggerError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly context?: Record<string, unknown>,
    public readonly innerError?: Error,
  ) {
    super(message);
    this.name = 'LoggerError';
  }
}

export enum LoggerErrorCode {
  CONFIG_VALIDATION_FAILED = 'CONFIG_VALIDATION_FAILED',
  CONFIG_UPDATE_FAILED = 'CONFIG_UPDATE_FAILED',

  FACTORY_CREATION_FAILED = 'FACTORY_CREATION_FAILED',
  FACTORY_NOT_SUPPORTED = 'FACTORY_NOT_SUPPORTED',

  BUFFER_OVERFLOW = 'BUFFER_OVERFLOW',
  BUFFER_FLUSH_FAILED = 'BUFFER_FLUSH_FAILED',

  LOG_PROCESSING_FAILED = 'LOG_PROCESSING_FAILED',
  PROCESSOR_CHAIN_BROKEN = 'PROCESSOR_CHAIN_BROKEN',

  RECOVERY_STRATEGY_FAILED = 'RECOVERY_STRATEGY_FAILED',
  FALLBACK_LOGGER_FAILED = 'FALLBACK_LOGGER_FAILED',

  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

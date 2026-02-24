export enum ConfigErrorCode {
  MISSING_REQUIRED_KEY = 'MISSING_REQUIRED_KEY',
  TYPE_MISMATCH = 'TYPE_MISMATCH',
  LOADER_FAILED = 'LOADER_FAILED',
  DEPENDENCY_VALIDATION_FAILED = 'DEPENDENCY_VALIDATION_FAILED',
  SOURCE_ACCESS_ERROR = 'SOURCE_ACCESS_ERROR', // 如 AWS 调用失败
}

export class ConfigError extends Error {
  constructor(
    message: string,
    public code: ConfigErrorCode,
    public options?: {
      key?: string;
      loaderName?: string;
      source?: string;
      cause?: Error;
      context?: Record<string, unknown>;
    },
  ) {
    super(message);
    this.name = 'ConfigError';
  }
}

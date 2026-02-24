export enum ConfigErrorCode {
  MissingRequiredKey = 'MISSING_REQUIRED_KEY',
  TypeMismatch = 'TYPE_MISMATCH',
  LoaderFailed = 'LOADER_FAILED',
  DependencyValidationFailed = 'DEPENDENCY_VALIDATION_FAILED',
  SourceAccessError = 'SOURCE_ACCESS_ERROR',
}

export class ConfigError extends Error {
  constructor(
    message: string,
    public code: ConfigErrorCode,
    public options?: {
      key?: string;
      loaderKey?: string;
      source?: string;
      cause?: Error;
      context?: Record<string, unknown>;
    },
  ) {
    super(message);
    this.name = 'ConfigError';
  }
}

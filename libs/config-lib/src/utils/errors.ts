export enum ConfigErrorCode {
  MISSING_REQUIRED_KEY = 'MISSING_REQUIRED_KEY',
  TYPE_MISMATCH = 'TYPE_MISMATCH',
  LOADER_FAILED = 'LOADER_FAILED',
}

export class ConfigError extends Error {
  constructor(
    message: string,
    public code: ConfigErrorCode,
    public key?: string,
    public loaderName?: string,
  ) {
    super(message);
    this.name = 'ConfigError';
  }
}

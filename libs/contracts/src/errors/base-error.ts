import { ErrorCode } from '@app/contracts/errors/error.codes';

export abstract class BaseError extends Error {
  protected constructor(
    message: string,
    public readonly code: ErrorCode,
    public readonly context?: Record<string, unknown>,
    public readonly innerError?: Error,
  ) {
    super(message);
    this.name = this.constructor.name;
    if (innerError) {
      this.cause = innerError;
    }
    Error.captureStackTrace(this, this.constructor);
  }
}

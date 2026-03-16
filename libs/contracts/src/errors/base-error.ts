import { ErrorCode } from '@app/contracts/errors/error.codes';

export abstract class BaseError<
  TContext extends Record<string, unknown> = Record<string, unknown>,
> extends Error {
  protected constructor(
    message: string,
    public readonly code: ErrorCode,
    public readonly context: TContext,
    cause?: unknown,
  ) {
    super(message);
    this.name = this.constructor.name;
    if (cause) {
      this.cause = cause;
    }
    Error.captureStackTrace(this, this.constructor);
  }
}

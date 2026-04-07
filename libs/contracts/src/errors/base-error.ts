export type ErrorResponse = {
  statusCode: number;
  domainCode: string;
  message: string;
  timestamp: Date;
} & Record<string, unknown>;

export abstract class BaseError<
  TContext extends Record<string, unknown> = Record<string, unknown>,
> extends Error {
  protected constructor(
    message: string,
    public readonly code: string,
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

  toErrorResponse(): ErrorResponse {
    return {
      statusCode: 500,
      domainCode: this.code,
      message: this.message,
      timestamp: new Date(),
      ...this.context,
    };
  }
}

import { BaseError, ErrorResponse } from './base-error';
import { ErrorCode } from './error.codes';

interface SerializableError {
  name: string;
  message: string;
  stack?: string;
  cause?: SerializableError;
}

const makeSerializable = (error: unknown): SerializableError => {
  const isError = error instanceof Error;
  return {
    name: isError ? error.name : 'unknown',
    message: isError ? error.message : String(error),
    ...(isError
      ? {
          stack: error.stack,
          cause: makeSerializable(error.cause),
        }
      : {}),
  };
};

export class UnknownError extends BaseError<{
  originalError: SerializableError;
}> {
  constructor(error: unknown) {
    super('Internal server error', ErrorCode.UNKNOWN, {
      originalError: makeSerializable(error),
    });
  }

  override toErrorResponse(): ErrorResponse {
    return {
      statusCode: 500,
      domainCode: this.code,
      message: this.message,
      timestamp: new Date(),
    };
  }
}

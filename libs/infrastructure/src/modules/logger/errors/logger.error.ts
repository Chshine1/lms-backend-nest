import { BaseError } from '@app/contracts/errors/base-error';
import { ErrorCode } from '@app/contracts/errors/error.codes';
import { toError } from '@app/contracts/errors/to-error.util';

export class LoggerError extends BaseError {}

export class LoggerUnknownError extends LoggerError {
  constructor(
    message: string,
    context?: Record<string, unknown>,
    cause?: unknown,
  ) {
    super(message, ErrorCode.LOGGER_UNKNOWN_ERROR, context, toError(cause));
  }
}

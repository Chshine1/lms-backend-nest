import { ErrorCode } from '@app/contracts/errors/error.codes';
import {
  LoggerError,
  LoggerUnknownError,
} from '@app/infrastructure/modules/logger/errors/logger.error';
import { toError } from '@app/contracts/errors/to-error.util';

interface SinkErrorFrame {
  type: string;
  id: string;
  details?: Record<string, unknown>;
}

export class LoggerSinkError extends LoggerError {
  constructor(sinkErrorStack: SinkErrorFrame[], rootError: Error) {
    super(
      `Logging pipeline breaks due to sink errors`,
      ErrorCode.LOGGER_SINK_ERROR,
      {
        sinkErrorStack,
      },
      rootError,
    );
  }
}

export function createLoggerSinkError(
  currentFrame: SinkErrorFrame,
  originalError: unknown,
): LoggerSinkError {
  let stack: SinkErrorFrame[];

  if (originalError instanceof LoggerSinkError) {
    const originalStack = (originalError.context || {})['sinkErrorStack'] as
      | SinkErrorFrame[]
      | undefined;
    if (originalStack) {
      stack = [...originalStack];
    } else {
      throw new LoggerUnknownError(
        'Malformed LoggerSinkError detected, resetting error stack',
        {},
        originalStack,
      );
    }

    stack.push({ ...currentFrame });
  } else {
    stack = [{ ...currentFrame }];
  }

  return new LoggerSinkError(stack, toError(originalError));
}

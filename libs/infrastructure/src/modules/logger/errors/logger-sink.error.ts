import { ErrorCode } from '@app/contracts';
import { LoggerError } from './logger.error';

interface SinkErrorFrame {
  type: string;
  id: string;
  details?: Record<string, unknown>;
}

export class LoggerSinkError extends LoggerError<{
  sinkErrorStack: SinkErrorFrame[];
}> {
  constructor(sinkErrorStack: SinkErrorFrame[], rootError: unknown) {
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
  const newStack: SinkErrorFrame[] =
    originalError instanceof LoggerSinkError
      ? [...originalError.context.sinkErrorStack, { ...currentFrame }]
      : [{ ...currentFrame }];

  const rootError: unknown =
    originalError instanceof LoggerSinkError
      ? originalError.cause
      : originalError;

  return new LoggerSinkError(newStack, rootError);
}

import { ErrorCode } from '@app/contracts/errors/error.codes';
import { RabbitMQError } from '@app/rabbitmq/errors/rabbitmq.error';

export class RabbitMQChannelError extends RabbitMQError<{
  operation: string;
}> {
  constructor(
    public readonly operation: string,
    cause: unknown,
  ) {
    super(
      `RabbitMQ channel operation failed: ${operation}`,
      ErrorCode.RABBITMQ_CHANNEL_ERROR,
      { operation },
      cause,
    );
  }
}

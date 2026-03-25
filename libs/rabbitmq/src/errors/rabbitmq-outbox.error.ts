import { ErrorCode } from '@app/contracts';
import { RabbitMQError } from './rabbitmq.error';

export class RabbitMQOutboxError extends RabbitMQError<{
  operation: string;
}> {
  constructor(
    public readonly operation: string,
    cause: unknown,
  ) {
    super(
      `Outbox operation failed: ${operation}`,
      ErrorCode.RABBITMQ_OUTBOX_ERROR,
      { operation },
      cause,
    );
  }
}

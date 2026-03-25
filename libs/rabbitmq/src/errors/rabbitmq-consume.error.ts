import { ErrorCode } from '@app/contracts';
import { RabbitMQError } from './rabbitmq.error';

export class RabbitMQConsumeError extends RabbitMQError<{
  queue: string;
}> {
  constructor(
    public readonly queue: string,
    cause: unknown,
  ) {
    super(
      `Failed to consume from queue: ${queue}`,
      ErrorCode.RABBITMQ_CONSUME_ERROR,
      { queue },
      cause,
    );
  }
}

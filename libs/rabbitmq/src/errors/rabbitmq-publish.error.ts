import { ErrorCode } from '@app/contracts';
import { RabbitMQError } from './rabbitmq.error';

export class RabbitMQPublishError extends RabbitMQError<{
  exchange: string;
  routingKey: string;
}> {
  constructor(
    public readonly exchange: string,
    public readonly routingKey: string,
    cause: unknown,
  ) {
    super(
      `Failed to publish message to ${exchange}/${routingKey}`,
      ErrorCode.RABBITMQ_PUBLISH_ERROR,
      { exchange, routingKey },
      cause,
    );
  }
}

import { ErrorCode } from '@app/contracts/errors/error.codes';
import { RabbitMQError } from '@app/rabbitmq/errors/rabbitmq.error';

export class RabbitMQConnectionError extends RabbitMQError<{
  host: string;
  port: number;
}> {
  constructor(
    public readonly host: string,
    public readonly port: number,
    cause: unknown,
  ) {
    super(
      `Failed to connect to RabbitMQ at ${host}:${port}`,
      ErrorCode.RABBITMQ_CONNECTION_ERROR,
      { host, port },
      cause,
    );
  }
}

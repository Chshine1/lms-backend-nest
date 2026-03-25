import { ErrorCode } from '@app/contracts';
import { RabbitMQError } from './rabbitmq.error';

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
      `Failed to connect to RabbitMQ at ${host}:${port.toString()}`,
      ErrorCode.RABBITMQ_CONNECTION_ERROR,
      { host, port },
      cause,
    );
  }
}

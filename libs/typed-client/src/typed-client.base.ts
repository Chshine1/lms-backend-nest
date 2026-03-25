import { Inject } from '@nestjs/common';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import {
  TYPED_CLIENT_MQ_OPTIONS,
  type TypedClientMqOptions,
} from './typed-client.module';

export abstract class TypedClientBase<
  TPatterns extends Record<string, { request: unknown; response: unknown }> =
    Record<string, { request: unknown; response: unknown }>,
> {
  protected readonly exchange: string;
  protected readonly timeout: number;

  protected constructor(
    protected readonly amqpConnection: AmqpConnection,
    @Inject(TYPED_CLIENT_MQ_OPTIONS) options: TypedClientMqOptions,
  ) {
    this.exchange = options.exchange;
    this.timeout = options.timeout ?? 30000;
  }

  protected async rpc<T extends keyof TPatterns>(
    pattern: T,
    data: TPatterns[T]['request'],
  ): Promise<TPatterns[T]['response']> {
    const routingKey = pattern as string;

    return await this.amqpConnection.request<TPatterns[T]['response']>({
      exchange: this.exchange,
      routingKey,
      payload: data,
      timeout: this.timeout,
    });
  }

  protected async publish<T extends keyof TPatterns>(
    pattern: T,
    data: TPatterns[T]['request'],
  ): Promise<void> {
    const routingKey = pattern as string;
    await this.amqpConnection.publish(this.exchange, routingKey, data);
  }
}

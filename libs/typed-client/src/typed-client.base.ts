import { Inject } from '@nestjs/common';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import {
  TYPED_CLIENT_MQ_OPTIONS,
  type TypedClientMqOptions,
} from './typed-client.module';
import { TraceService } from '@app/trace';

export abstract class TypedClientBase<
  TPatterns extends Record<string, { request: unknown; response: unknown }> =
    Record<string, { request: unknown; response: unknown }>,
> {
  protected readonly exchange: string;

  protected constructor(
    private readonly amqpConnection: AmqpConnection,
    private readonly traceService: TraceService,
    @Inject(TYPED_CLIENT_MQ_OPTIONS) options: TypedClientMqOptions,
  ) {
    this.exchange = options.exchange;
  }

  protected async rpc<T extends keyof TPatterns & string>(
    pattern: T,
    data: TPatterns[T]['request'],
  ): Promise<TPatterns[T]['response']> {
    const traceId = this.traceService.getTraceId();

    return await this.amqpConnection.request<TPatterns[T]['response']>({
      exchange: this.exchange,
      routingKey: pattern,
      headers: {
        'x-trace-id': traceId,
      },
      payload: data,
    });
  }

  protected async publish<T extends keyof TPatterns & string>(
    pattern: T,
    data: TPatterns[T]['request'],
  ): Promise<void> {
    const traceId = this.traceService.getTraceId();

    await this.amqpConnection.publish(this.exchange, pattern, data, {
      headers: {
        'x-trace-id': traceId,
      },
    });
  }
}

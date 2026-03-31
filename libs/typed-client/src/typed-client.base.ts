import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { type TypedClientMqOptions } from './typed-client.module';
import { TraceService } from '@app/trace';
import { UserContextService } from '@app/authentication';

export abstract class TypedClientBase<
  TPatterns extends Record<string, { request: unknown; response: unknown }> =
    Record<string, { request: unknown; response: unknown }>,
> {
  protected readonly exchange: string;

  public constructor(
    private readonly amqpConnection: AmqpConnection,
    private readonly traceService: TraceService,
    private readonly userContextService: UserContextService,
    options: TypedClientMqOptions,
  ) {
    this.exchange = options.exchange;
  }

  protected async rpc<T extends keyof TPatterns & string>(
    pattern: T,
    data: TPatterns[T]['request'],
  ): Promise<TPatterns[T]['response']> {
    const traceId = this.traceService.getTraceId();
    const userId = this.userContextService.getUserId();

    return await this.amqpConnection.request<TPatterns[T]['response']>({
      exchange: this.exchange,
      routingKey: pattern,
      headers: {
        'x-user-id': userId,
        'x-trace-id': traceId,
      },
      payload: data,
    });
  }
}

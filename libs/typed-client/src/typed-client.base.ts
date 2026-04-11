import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { UserContextService } from '@app/authentication';
import { RpcResult } from '@app/contracts';
import { MicroserviceError } from '@app/contracts';

export abstract class TypedClientBase<
  TPatterns extends Record<string, { request: unknown; response: unknown }> =
    Record<string, { request: unknown; response: unknown }>,
> {
  protected readonly exchange: string;

  protected constructor(
    private readonly serviceName: string,
    private readonly amqpConnection: AmqpConnection,
    private readonly userContextService: UserContextService,
    options: {
      exchange: string;
    },
  ) {
    this.exchange = options.exchange;
  }

  protected async rpc<T extends keyof TPatterns & string>(
    pattern: T,
    data: TPatterns[T]['request'],
  ): Promise<TPatterns[T]['response']> {
    const userId = this.userContextService.getUserId();

    const result = await this.amqpConnection.request<
      RpcResult<TPatterns[T]['response']>
    >({
      exchange: this.exchange,
      routingKey: pattern,
      headers: {
        'x-user-id': userId,
      },
      payload: data,
      timeout: 10000,
    });

    if (result.success) return result.data;
    throw new MicroserviceError(this.serviceName, result.error);
  }
}

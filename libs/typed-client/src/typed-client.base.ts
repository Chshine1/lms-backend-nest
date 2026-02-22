import { ClientProxy } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';

export abstract class TypedClientBase<
  TPatterns extends Record<string, { request: unknown; response: unknown }>,
> {
  protected constructor(protected readonly client: ClientProxy) {}

  protected send<T extends keyof TPatterns>(
    pattern: T,
    data: TPatterns[T]['request'],
  ): Promise<TPatterns[T]['response']> {
    return lastValueFrom(
      this.client.send<TPatterns[T]['response']>(pattern, data),
    );
  }
}

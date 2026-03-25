import { BaseError } from '@app/contracts';

export class RabbitMQError<
  TContext extends Record<string, unknown>,
> extends BaseError<TContext> {}

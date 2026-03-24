import { BaseError } from '@app/contracts/errors/base-error';

export class RabbitMQError<
  TContext extends Record<string, unknown>,
> extends BaseError<TContext> {}

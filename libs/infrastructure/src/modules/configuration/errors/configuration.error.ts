import { BaseError } from '@app/contracts/errors/base-error';

export class ConfigurationError<
  TContext extends Record<string, unknown>,
> extends BaseError<TContext> {}

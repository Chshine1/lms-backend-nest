import { BaseError } from '@app/contracts';

export class ConfigurationError<
  TContext extends Record<string, unknown>,
> extends BaseError<TContext> {}

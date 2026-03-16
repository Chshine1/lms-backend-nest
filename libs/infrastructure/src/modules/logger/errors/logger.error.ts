import { BaseError } from '@app/contracts/errors/base-error';

export class LoggerError<
  TContext extends Record<string, unknown>,
> extends BaseError<TContext> {}

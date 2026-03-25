import { BaseError } from '@app/contracts';

export class LoggerError<
  TContext extends Record<string, unknown>,
> extends BaseError<TContext> {}

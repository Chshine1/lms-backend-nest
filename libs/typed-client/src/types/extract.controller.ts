import { TypedClientBase } from '../typed-client.base';

export type ExtractController<TTypedClient extends TypedClientBase> = Omit<
  TTypedClient,
  keyof TypedClientBase
>;

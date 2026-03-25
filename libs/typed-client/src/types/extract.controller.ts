import { TypedClientBase } from '@app/typed-client/typed-client.base';

export type ExtractController<TTypedClient extends TypedClientBase> = Omit<
  TTypedClient,
  keyof TypedClientBase
>;

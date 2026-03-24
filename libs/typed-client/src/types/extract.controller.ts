import { TypedClientBase } from '@app/typed-client/typed-client.base';

export type ExtractController<
  TTypedClient extends TypedClientBase<
    Record<
      string,
      {
        request: unknown;
        response: unknown;
      }
    >
  >,
> = Omit<
  TTypedClient,
  keyof TypedClientBase<
    Record<
      string,
      {
        request: unknown;
        response: unknown;
      }
    >
  >
>;

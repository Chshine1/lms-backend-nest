import { ErrorResponse } from '../errors/index';

export type RpcResult<TData> =
  | { success: true; data: TData; timestamp: Date }
  | { success: false; error: ErrorResponse };

export function toError(cause: unknown): Error {
  if (cause instanceof Error) return cause;
  const error = new Error(String(cause));
  if (typeof error.cause === 'undefined') {
    Object.defineProperty(error, 'cause', { value: cause, enumerable: false });
  }
  return error;
}

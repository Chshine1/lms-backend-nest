export interface UserPatterns extends Record<
  string,
  { request: unknown; response: unknown }
> {
  'user.validateExists': {
    request: number[];
    response: boolean[];
  };
}

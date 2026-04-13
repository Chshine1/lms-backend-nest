export interface UserPatterns extends Record<
  string,
  { request: unknown; response: unknown }
> {
}

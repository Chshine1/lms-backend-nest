export interface FilePatterns extends Record<
  string,
  { request: unknown; response: unknown }
> {
  'file.validateExists': {
    request: number[];
    response: boolean[];
  };
}

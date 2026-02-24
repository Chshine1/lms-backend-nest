export interface Logger {
  fatal(message: string, ...args: unknown[]): void;
  error(message: string, ...args: unknown[]): void;
  warn(message: string, ...args: unknown[]): void;
  info(message: string, ...args: unknown[]): void;
  debug(message: string, ...args: unknown[]): void;
  trace(message: string, ...args: unknown[]): void;

  logStructured(event: string, data: Record<string, unknown>): void;

  child(fields: Record<string, unknown>): Logger;
}

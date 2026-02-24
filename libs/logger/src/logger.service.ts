import { Injectable, Inject } from '@nestjs/common';
import { createPinoLogger } from './pino/pino-logger';
import type { LoggerConfig } from '@app/logger/interfaces/logger-config.interface';
import type { Logger } from '@app/logger/interfaces/logger.interface';

export const LOGGER_CONFIG = 'LOGGER_CONFIG';

@Injectable()
export class LoggerService implements Logger {
  private logger: Logger;

  constructor(@Inject(LOGGER_CONFIG) config: LoggerConfig) {
    this.logger = createPinoLogger(config);
  }

  fatal(message: string, ...args: unknown[]): void {
    this.logger.fatal(message, ...args);
  }
  error(message: string, ...args: unknown[]): void {
    this.logger.error(message, ...args);
  }
  warn(message: string, ...args: unknown[]): void {
    this.logger.warn(message, ...args);
  }
  info(message: string, ...args: unknown[]): void {
    this.logger.info(message, ...args);
  }
  debug(message: string, ...args: unknown[]): void {
    this.logger.debug(message, ...args);
  }
  trace(message: string, ...args: unknown[]): void {
    this.logger.trace(message, ...args);
  }
  logStructured(event: string, data: Record<string, unknown>): void {
    this.logger.logStructured(event, data);
  }
  child(fields: Record<string, unknown>): Logger {
    return this.logger.child(fields);
  }
}

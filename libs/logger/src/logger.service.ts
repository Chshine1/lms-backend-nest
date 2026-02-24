import { Inject, Injectable } from '@nestjs/common';
import { createPinoLogger } from './pino/pino-logger';
import type { LoggerConfig } from '@app/logger/interfaces/logger-config.interface';
import type { Logger } from '@app/logger/interfaces/logger.interface';

export const LOGGER_CONFIG = 'LOGGER_CONFIG';

@Injectable()
export class LoggerService implements Logger {
  private currentLogger: Logger;
  private buffer: Array<{ level: string; message: string; args: unknown[] }> =
    [];
  private isBootstrapping: boolean;

  constructor(@Inject(LOGGER_CONFIG) config: LoggerConfig) {
    this.isBootstrapping = config.bootstrap;
    this.currentLogger = createPinoLogger(config);
  }

  updateConfig(newConfig: LoggerConfig): void {
    const newLogger = createPinoLogger(newConfig);

    if (this.isBootstrapping && this.buffer.length > 0) {
      for (const log of this.buffer) {
        this.forwardToLogger(newLogger, log);
      }
      this.buffer = [];
    }

    this.currentLogger = newLogger;
    this.isBootstrapping = false;
  }

  private forwardToLogger(
    logger: Logger,
    log: { level: string; message: string; args: unknown[] },
  ): void {
    switch (log.level) {
      case 'fatal':
        logger.fatal(log.message, ...log.args);
        break;
      case 'error':
        logger.error(log.message, ...log.args);
        break;
      case 'warn':
        logger.warn(log.message, ...log.args);
        break;
      case 'info':
        logger.info(log.message, ...log.args);
        break;
      case 'debug':
        logger.debug(log.message, ...log.args);
        break;
      case 'trace':
        logger.trace(log.message, ...log.args);
        break;
      default:
        logger.info(log.message, ...log.args);
    }
  }

  fatal(message: string, ...args: unknown[]): void {
    this.currentLogger.fatal(message, ...args);
    if (this.isBootstrapping)
      this.buffer.push({ level: 'fatal', message, args });
  }
  error(message: string, ...args: unknown[]): void {
    this.currentLogger.error(message, ...args);
    if (this.isBootstrapping)
      this.buffer.push({ level: 'error', message, args });
  }
  warn(message: string, ...args: unknown[]): void {
    this.currentLogger.warn(message, ...args);
    if (this.isBootstrapping)
      this.buffer.push({ level: 'warn', message, args });
  }
  info(message: string, ...args: unknown[]): void {
    this.currentLogger.info(message, ...args);
    if (this.isBootstrapping)
      this.buffer.push({ level: 'info', message, args });
  }
  debug(message: string, ...args: unknown[]): void {
    this.currentLogger.debug(message, ...args);
    if (this.isBootstrapping)
      this.buffer.push({ level: 'debug', message, args });
  }
  trace(message: string, ...args: unknown[]): void {
    this.currentLogger.trace(message, ...args);
    if (this.isBootstrapping)
      this.buffer.push({ level: 'trace', message, args });
  }

  logStructured(event: string, data: Record<string, unknown>): void {
    if (this.isBootstrapping) {
      this.buffer.push({ level: 'info', message: event, args: [data] });
    } else {
      this.currentLogger.logStructured(event, data);
    }
  }

  child(fields: Record<string, unknown>): Logger {
    return {
      fatal: (message: string, ...args: unknown[]): void => {
        this.currentLogger.child(fields).fatal(message, ...args);
      },
      error: (message: string, ...args: unknown[]): void => {
        this.currentLogger.child(fields).error(message, ...args);
      },
      warn: (message: string, ...args: unknown[]): void => {
        this.currentLogger.child(fields).warn(message, ...args);
      },
      info: (message: string, ...args: unknown[]): void => {
        this.currentLogger.child(fields).info(message, ...args);
      },
      debug: (message: string, ...args: unknown[]): void => {
        this.currentLogger.child(fields).debug(message, ...args);
      },
      trace: (message: string, ...args: unknown[]): void => {
        this.currentLogger.child(fields).trace(message, ...args);
      },
      logStructured: (event: string, data: Record<string, unknown>): void => {
        this.currentLogger.child(fields).logStructured(event, data);
      },
      child: (nestedFields: Record<string, unknown>): Logger =>
        this.currentLogger.child({ ...fields, ...nestedFields }),
    };
  }
}

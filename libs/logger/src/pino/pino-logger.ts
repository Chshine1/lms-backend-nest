import type { LoggerConfig } from '@app/logger/interfaces/logger-config.interface';
import type { Logger } from '@app/logger/interfaces/logger.interface';
import { LogLevel } from '@app/contracts/config/logger-lib.config';
import pino from 'pino';

export function createPinoLogger(config: LoggerConfig): pino.Logger {
  return pino(config);
}

export function adaptPinoToLogger(pinoInstance: pino.Logger): Logger {
  return {
    fatal: pinoInstance.fatal.bind(pinoInstance),
    error: pinoInstance.error.bind(pinoInstance),
    warn: pinoInstance.warn.bind(pinoInstance),
    info: pinoInstance.info.bind(pinoInstance),
    debug: pinoInstance.debug.bind(pinoInstance),
    trace: pinoInstance.trace.bind(pinoInstance),

    logEvent(event: string, metadata: Record<string, unknown>): void {
      pinoInstance.info({ event, ...metadata }, `Event: ${event}`);
    },

    logEventWithLevel(
      level: LogLevel,
      event: string,
      metadata: Record<string, unknown>,
    ): void {
      const logMethod = getPinoLogMethod(pinoInstance, level);
      logMethod({ event, ...metadata }, `Event: ${event}`);
    },

    child: (fields) => adaptPinoToLogger(pinoInstance.child(fields)),
  };
}

function getPinoLogMethod(
  pinoInstance: pino.Logger,
  level: LogLevel,
): (...args: unknown[]) => void {
  switch (level) {
    case LogLevel.fatal:
      return pinoInstance.fatal.bind(pinoInstance);
    case LogLevel.error:
      return pinoInstance.error.bind(pinoInstance);
    case LogLevel.warn:
      return pinoInstance.warn.bind(pinoInstance);
    case LogLevel.info:
      return pinoInstance.info.bind(pinoInstance);
    case LogLevel.debug:
      return pinoInstance.debug.bind(pinoInstance);
    case LogLevel.trace:
      return pinoInstance.trace.bind(pinoInstance);
    default:
      return pinoInstance.info.bind(pinoInstance);
  }
}

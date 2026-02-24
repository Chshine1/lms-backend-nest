import type { LoggerConfig } from '@app/logger/interfaces/logger-config.interface';
import type { Logger } from '@app/logger/interfaces/logger.interface';
import pino from 'pino';

export function createPinoLogger(config: LoggerConfig): Logger {
  const pinoInstance = pino(config);
  return adaptPinoToLogger(pinoInstance);
}

function adaptPinoToLogger(pino: pino.Logger): Logger {
  return {
    fatal: pino.fatal.bind(pino),
    error: pino.error.bind(pino),
    warn: pino.warn.bind(pino),
    info: pino.info.bind(pino),
    debug: pino.debug.bind(pino),
    trace: pino.trace.bind(pino),
    logStructured(event: string, data: Record<string, unknown>): void {
      pino.info({ event, ...data }, 'structured event');
    },
    child: (fields) => adaptPinoToLogger(pino.child(fields)),
  };
}

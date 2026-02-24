import type { LoggerConfig } from '../interfaces/logger-config.interface';
import type { Logger } from '../interfaces/logger.interface';
import { createPinoLogger } from '@app/logger/pino/pino-logger';

const logLevels = ['debug', 'info', 'warn', 'error', 'fatal', 'trace'] as const;

export function createBootstrapLogger(
  overrides?: Partial<LoggerConfig>,
): Logger {
  const config: LoggerConfig = {
    level:
      logLevels.find((l) => l === process.env['BOOTSTRAP_LOG_LEVEL']) ?? 'info',
    prettyPrint: process.env['NODE_ENV'] === 'development',
    baseFields: { service: 'bootstrap' },
    ...overrides,
  };

  return createPinoLogger(config);
}

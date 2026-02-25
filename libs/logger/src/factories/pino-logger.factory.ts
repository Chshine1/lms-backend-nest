import { LoggerFactory } from '../interfaces/logger-factory.interface';
import { Logger } from '../interfaces/logger.interface';
import { LoggerConfig } from '../interfaces/logger-config.interface';
import { createPinoLogger, adaptPinoToLogger } from '../pino/pino-logger';

export class PinoLoggerFactory extends LoggerFactory {
  override createLogger(config: LoggerConfig): Logger {
    try {
      const pinoInstance = createPinoLogger(config);
      return adaptPinoToLogger(pinoInstance);
    } catch (error) {
      throw new Error(
        `Failed to create Pino logger: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  override supports(loggerType: string): boolean {
    return loggerType === 'pino' || loggerType === 'default';
  }
}

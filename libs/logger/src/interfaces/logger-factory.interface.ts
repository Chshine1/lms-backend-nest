import { Logger } from './logger.interface';
import { LoggerConfig } from './logger-config.interface';

export abstract class LoggerFactory {
  abstract createLogger(config: LoggerConfig): Logger;
  abstract supports(loggerType: string): boolean;
}

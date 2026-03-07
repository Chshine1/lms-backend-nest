import { LoggerConfig } from './logger-config.interface';
import { LoggerInstance } from './logger.interface';

export abstract class LoggerFactory {
  abstract createLogger(config: LoggerConfig): LoggerInstance;
}

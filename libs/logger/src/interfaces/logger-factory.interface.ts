import { LoggerConfig } from './logger-config.interface';
import { Logger } from './logger.interface';

export interface LoggerFactory {
  createLogger(config: LoggerConfig): Logger;
  supports(loggerType: string): boolean;
}

export abstract class LoggerFactoryBase implements LoggerFactory {
  abstract createLogger(config: LoggerConfig): Logger;
  abstract supports(loggerType: string): boolean;
}

import { LoggerConfig } from './logger-config.interface';
import { EventLogger } from './logger.interface';

export interface LoggerFactory {
  createLogger(config: LoggerConfig): EventLogger;
  supports(loggerType: string): boolean;
}

export abstract class LoggerFactoryBase implements LoggerFactory {
  abstract createLogger(config: LoggerConfig): EventLogger;
  abstract supports(loggerType: string): boolean;
}

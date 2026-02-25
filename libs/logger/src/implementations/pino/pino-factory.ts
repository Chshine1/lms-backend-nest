import { Injectable } from '@nestjs/common';
import { LoggerFactoryBase } from '../../interfaces/logger-factory.interface';
import { Logger } from '../../interfaces/logger.interface';
import { LoggerConfig } from '../../interfaces/logger-config.interface';
import { PinoLogger } from './pino-logger';
import {
  LoggerError,
  LoggerErrorCode,
} from '../../interfaces/error-recovery.interface';
import { pino } from 'pino';

@Injectable()
export class PinoFactory extends LoggerFactoryBase {
  createLogger(config: LoggerConfig): Logger {
    try {
      return new PinoLogger(pino(config));
    } catch (error) {
      throw new LoggerError(
        `Failed to create Pino logger: ${error instanceof Error ? error.message : 'Unknown error'}`,
        LoggerErrorCode.FACTORY_CREATION_FAILED,
        { loggerType: 'pino', config },
        error instanceof Error ? error : new Error(String(error)),
      );
    }
  }

  supports(loggerType: string): boolean {
    const supportedTypes = ['pino', 'default'];
    return supportedTypes.includes(loggerType.toLowerCase());
  }
}

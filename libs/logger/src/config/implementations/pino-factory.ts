import { Injectable } from '@nestjs/common';
import {
  LoggerFactory,
  LoggerInstance,
} from '@app/logger/core/contracts/logger.abstraction';
import { LoggerConfig } from '@app/logger/core/contracts/logger-config.interface';
import { PinoLoggerInstance } from './pino-logger.instance';
import { pino } from 'pino';
import { LoggerError, LoggerErrorCode } from '@app/logger/logger.error';

@Injectable()
export class PinoFactory extends LoggerFactory {
  createLogger(config: LoggerConfig): LoggerInstance {
    try {
      const pinoInstance = pino(config);
      return new PinoLoggerInstance(pinoInstance);
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

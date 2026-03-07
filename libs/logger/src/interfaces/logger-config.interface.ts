import { LoggerLibConfig } from '@app/contracts/config/logger-lib.config';

export interface LoggerConfig extends LoggerLibConfig {
  buffer?: {
    enabled: boolean;
    maxSize: number;
    flushInterval: number;
  };
}

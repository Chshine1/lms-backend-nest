import { LoggerLibConfig } from '@app/contracts/config/logger-lib.config';

export interface LoggerConfig extends LoggerLibConfig {
  bootstrap: boolean;
  buffer?: {
    enabled: boolean;
    maxSize: number;
    flushInterval: number;
  };
}

import { LoggerLibConfig } from '@app/contracts/config/logger-lib.config';

export type LoggerConfig = {
  bootstrap: boolean;
} & LoggerLibConfig;

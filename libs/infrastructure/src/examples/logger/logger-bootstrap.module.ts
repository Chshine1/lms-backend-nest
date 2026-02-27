import { Module } from '@nestjs/common';
import { LoggerBootstrapService } from './logger-bootstrap.service';

export const LOGGER_SERVICE_TOKEN = Symbol('LOGGER_SERVICE');

@Module({
  providers: [
    {
      provide: LOGGER_SERVICE_TOKEN,
      useClass: LoggerBootstrapService,
    },
    LoggerBootstrapService,
  ],
  exports: [LOGGER_SERVICE_TOKEN, LoggerBootstrapService],
})
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class LoggerBootstrapModule {}

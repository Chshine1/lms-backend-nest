import { Module } from '@nestjs/common';
import { LoggerRuntimeService } from './logger-runtime.service';
import { LOGGER_SERVICE_TOKEN } from './logger-bootstrap.module';

@Module({
  providers: [
    {
      provide: LOGGER_SERVICE_TOKEN,
      useClass: LoggerRuntimeService,
    },
    LoggerRuntimeService,
  ],
  exports: [LOGGER_SERVICE_TOKEN, LoggerRuntimeService],
})
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class LoggerRuntimeModule {}

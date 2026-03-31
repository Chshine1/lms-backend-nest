import { Module } from '@nestjs/common';
import { TraceService } from './trace.service';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { RabbitMqTraceInterceptor } from './rabbitmq-trace.interceptor';

@Module({
  providers: [
    TraceService,
    {
      provide: APP_INTERCEPTOR,
      useClass: RabbitMqTraceInterceptor,
    },
  ],
  exports: [TraceService],
})
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class TraceModule {}

import { Module } from '@nestjs/common';
import { EventBusService } from '@app/infrastructure/modules/event-bus/event-bus.service';

@Module({
  providers: [EventBusService],
  exports: [EventBusService],
})
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class EventBusModule {}

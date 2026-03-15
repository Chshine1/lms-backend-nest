import { Injectable, Module } from '@nestjs/common';
import { EventBusService } from '@app/infrastructure/modules/event-bus/event-bus.service';

export type BootstrapEvents = {
  'config.loaded': unknown;
};
@Injectable()
export class BootstrapEventBus extends EventBusService<BootstrapEvents> {}

@Module({
  providers: [BootstrapEventBus],
  exports: [BootstrapEventBus],
})
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class EventBusModule {}

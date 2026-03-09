import { Injectable } from '@nestjs/common';
import mitt, { Emitter } from 'mitt';

export type BootstrapEvents = {
  'config.loaded': Record<string, unknown>;
};

@Injectable()
export class EventBusService {
  private readonly eventBus: Emitter<BootstrapEvents> = mitt<BootstrapEvents>();

  emit<K extends keyof BootstrapEvents>(
    event: K,
    payload: BootstrapEvents[K],
  ): void {
    this.eventBus.emit(event, payload);
  }

  on<K extends keyof BootstrapEvents>(
    event: K,
    callback: (payload: BootstrapEvents[K]) => void,
  ): void {
    this.eventBus.on(event, callback);
  }
}

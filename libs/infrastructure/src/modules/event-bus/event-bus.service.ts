import { Injectable } from '@nestjs/common';
import mitt, { Emitter } from 'mitt';

export type BootstrapEvents = {
  'config.loaded': unknown;
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

  async on<K extends keyof BootstrapEvents>(
    event: K,
  ): Promise<BootstrapEvents[K]> {
    return new Promise((resolve) => {
      this.eventBus.on(event, resolve);
    });
  }
}

import { Injectable } from '@nestjs/common';
import mitt, { Emitter } from 'mitt';

export type BootstrapEvents = {
  'config.loaded': unknown;
};

@Injectable()
export class EventBusService {
  private readonly eventBus: Emitter<BootstrapEvents> = mitt<BootstrapEvents>();
  private readonly eventCache = new Map<
    keyof BootstrapEvents,
    BootstrapEvents[keyof BootstrapEvents]
  >();

  emit<K extends keyof BootstrapEvents>(
    event: K,
    payload: BootstrapEvents[K],
  ): void {
    this.eventCache.set(event, payload);
    this.eventBus.emit(event, payload);
  }

  async on<K extends keyof BootstrapEvents>(
    event: K,
  ): Promise<BootstrapEvents[K]> {
    const cached = this.eventCache.get(event);
    if (cached !== undefined) {
      return cached;
    }

    return new Promise((resolve) => {
      const handler = (payload: BootstrapEvents[K]): void => {
        this.eventBus.off(event, handler);
        resolve(payload);
      };
      this.eventBus.on(event, handler);
    });
  }
}

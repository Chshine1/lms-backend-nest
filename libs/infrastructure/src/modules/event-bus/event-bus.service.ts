import mitt, { Emitter } from 'mitt';
import { Injectable } from '@nestjs/common';

@Injectable()
export class EventBusService<TEvents extends Record<string, unknown>> {
  private readonly eventBus: Emitter<TEvents> = mitt<TEvents>();
  private readonly eventCache = new Map<
    keyof TEvents,
    TEvents[keyof TEvents]
  >();

  emit<K extends keyof TEvents>(event: K, payload: TEvents[K]): void {
    this.eventCache.set(event, payload);
    this.eventBus.emit(event, payload);
  }

  async on<K extends keyof TEvents>(event: K): Promise<TEvents[K]> {
    const cached = this.eventCache.get(event);
    if (cached !== undefined) {
      return cached as TEvents[K];
    }

    return new Promise((resolve) => {
      const handler = (payload: TEvents[K]): void => {
        this.eventBus.off(event, handler);
        resolve(payload);
      };
      this.eventBus.on(event, handler);
    });
  }
}

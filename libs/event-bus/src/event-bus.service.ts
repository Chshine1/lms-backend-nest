import { Injectable, Logger } from '@nestjs/common';
import { DomainEvent } from './events/domain-event';
import { EventPublisher } from './interfaces/event-publisher.interface';

type EventHandler<T extends DomainEvent> = (event: T) => Promise<void>;

@Injectable()
export class EventBusService implements EventPublisher {
  private readonly logger = new Logger(EventBusService.name);
  private readonly subscribers = new Map<string, EventHandler<DomainEvent>[]>();

  async publish(event: DomainEvent): Promise<void> {
    const eventType = this.getEventType(event);
    const handlers = this.subscribers.get(eventType) ?? [];

    if (handlers.length === 0) {
      this.logger.warn(`No subscribers for event type: ${eventType}`);
      return;
    }

    this.logger.debug(
      `Publishing event ${eventType} to ${String(handlers.length)} subscribers`,
    );

    const results = await Promise.allSettled(
      handlers.map((handler) => handler(event)),
    );

    const failures = results.filter(
      (r): r is PromiseRejectedResult => r.status === 'rejected',
    );

    if (failures.length > 0) {
      this.logger.error(
        `${String(failures.length)} subscriber(s) failed for event ${eventType}`,
        failures.map((f) => String(f.reason)),
      );
    }
  }

  async publishBatch(events: DomainEvent[]): Promise<void> {
    await Promise.all(events.map((event) => this.publish(event)));
  }

  subscribe<T extends DomainEvent>(
    eventConstructor: new (...args: unknown[]) => T,
    handler: EventHandler<T>,
  ): void {
    const eventType = eventConstructor.name;
    const existing = this.subscribers.get(eventType) ?? [];
    existing.push(handler as EventHandler<DomainEvent>);
    this.subscribers.set(eventType, existing);
    this.logger.debug(`Subscribed handler to event: ${eventType}`);
  }

  private getEventType(event: DomainEvent): string {
    return event.eventType;
  }
}

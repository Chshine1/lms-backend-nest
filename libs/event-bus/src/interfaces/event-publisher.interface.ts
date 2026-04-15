import { DomainEvent } from '../events/domain-event';

export interface EventPublisher {
  publish(event: DomainEvent): Promise<void>;
  publishBatch(events: DomainEvent[]): Promise<void>;
}

export interface EventSubscriber<T extends DomainEvent> {
  handle(event: T): Promise<void>;
}

export interface EventBus {
  publish(event: DomainEvent): Promise<void>;
  subscribe<T extends DomainEvent>(
    eventConstructor: new (...args: unknown[]) => T,
    handler: (event: T) => Promise<void>,
  ): void;
}

import { DomainEvent } from '../events/domain-event';

export interface EventPublisher {
  publish<T extends DomainEvent>(event: T): Promise<void>;
  publishBatch<T extends DomainEvent>(events: T[]): Promise<void>;
}

export interface EventSubscriber<T extends DomainEvent> {
  handle(event: T): Promise<void>;
}

export interface EventBus {
  publish<T extends DomainEvent>(event: T): Promise<void>;
  subscribe<T extends DomainEvent>(
    eventConstructor: new (...args: unknown[]) => T,
    handler: (event: T) => Promise<void>,
  ): void;
}

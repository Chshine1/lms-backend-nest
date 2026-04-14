import { DomainEvent } from '../events/domain-event';
import { v4 as uuidv4 } from 'uuid';

export function createDomainEvent<T extends DomainEvent>(
  eventConstructor: new (...args: unknown[]) => T,
  ...args: unknown[]
): T {
  const event = new eventConstructor(...args) as T & {
    eventId: string;
    occurredAt: Date;
    eventType: string;
  };
  event.eventId = uuidv4();
  event.occurredAt = new Date();
  event.eventType = eventConstructor.prototype.constructor.name;
  return event;
}

export function createDomainEventWithMetadata<T extends DomainEvent>(
  eventConstructor: new (...args: unknown[]) => T,
  args: unknown[],
  correlationId?: string,
  causationId?: string,
): T & { eventId: string; occurredAt: Date; eventType: string } {
  const event = createDomainEvent(eventConstructor, ...args);
  return event;
}

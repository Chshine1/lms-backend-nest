import { SetMetadata } from '@nestjs/common';
import { DomainEvent } from '../events/domain-event';

export const EVENT_SUBSCRIBER_METADATA = '__eventSubscriber__';

export interface EventSubscriberMetadata {
  eventConstructor: new (...args: unknown[]) => DomainEvent;
}

export function OnEvent<T extends DomainEvent>(
  eventConstructor: new (...args: unknown[]) => T,
): MethodDecorator {
  return SetMetadata(EVENT_SUBSCRIBER_METADATA, {
    eventConstructor,
  } as EventSubscriberMetadata);
}

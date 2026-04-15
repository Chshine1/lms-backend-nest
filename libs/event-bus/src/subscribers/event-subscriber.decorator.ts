import { SetMetadata } from '@nestjs/common';
import { DomainEvent } from '../events/domain-event';

export const EVENT_SUBSCRIBER_METADATA = '__eventSubscriber__';

export interface EventSubscriberMetadata {
  eventConstructor: new (...args: unknown[]) => DomainEvent;
}

export function OnEvent(
  eventConstructor: new (...args: unknown[]) => DomainEvent,
): MethodDecorator {
  return SetMetadata(EVENT_SUBSCRIBER_METADATA, {
    eventConstructor,
  });
}

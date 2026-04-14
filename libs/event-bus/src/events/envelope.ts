import { DomainEvent, EventMetadata } from '../events/domain-event';

export interface EnvelopeBuilder<T extends DomainEvent> {
  withCorrelationId(correlationId: string): EnvelopeBuilder<T>;
  withCausationId(causationId: string): EnvelopeBuilder<T>;
  withCustomMetadata(key: string, value: unknown): EnvelopeBuilder<T>;
  build(): {
    event: T;
    metadata: EventMetadata;
  };
}

export function createEnvelope<T extends DomainEvent>(
  event: T,
  metadata?: Partial<EventMetadata>,
): {
  event: T;
  metadata: EventMetadata;
} {
  return {
    event,
    metadata: {
      correlationId: metadata?.correlationId,
      causationId: metadata?.causationId,
      timestamp: metadata?.timestamp ?? new Date(),
      ...metadata,
    },
  };
}

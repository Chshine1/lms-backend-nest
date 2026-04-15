export interface DomainEvent {
  readonly eventId: string;
  readonly occurredAt: Date;
  readonly eventType: string;
}

export interface EventMetadata {
  readonly correlationId?: string;
  readonly causationId?: string;
  readonly timestamp: Date;
  readonly [key: string]: unknown;
}

export interface EnvelopedEvent<T extends DomainEvent> {
  readonly event: T;
  readonly metadata: EventMetadata;
}

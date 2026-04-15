import { Injectable, Logger } from '@nestjs/common';
import {
  DomainEvent,
  EventMetadata,
  EnvelopedEvent,
} from '../events/domain-event';
import { EventPublisher } from '../interfaces/event-publisher.interface';

@Injectable()
export class InMemoryEventPublisher implements EventPublisher {
  private readonly logger = new Logger(InMemoryEventPublisher.name);
  private readonly handlers = new Map<
    string,
    ((event: DomainEvent) => Promise<void>)[]
  >();

  async publish(event: DomainEvent): Promise<void> {
    const handlers = this.handlers.get(event.eventType) ?? [];
    await Promise.all(handlers.map((handler) => handler(event)));
  }

  async publishBatch(events: DomainEvent[]): Promise<void> {
    await Promise.all(events.map((event) => this.publish(event)));
  }

  registerHandler(
    eventType: string,
    handler: (event: DomainEvent) => Promise<void>,
  ): void {
    const existing = this.handlers.get(eventType) ?? [];
    existing.push(handler);
    this.handlers.set(eventType, existing);
    this.logger.debug(`Registered handler for event type: ${eventType}`);
  }

  clear(): void {
    this.handlers.clear();
  }
}

export interface EventTransformer<T extends DomainEvent> {
  toBuffer(event: T, metadata: EventMetadata): Buffer;
  fromBuffer(buffer: Buffer): { event: T; metadata: EventMetadata };
}

export class JsonEventTransformer implements EventTransformer<DomainEvent> {
  toBuffer(event: DomainEvent, metadata: EventMetadata): Buffer {
    return Buffer.from(JSON.stringify({ event, metadata }));
  }

  fromBuffer(buffer: Buffer): EnvelopedEvent<DomainEvent> {
    const parsed = JSON.parse(buffer.toString()) as EnvelopedEvent<DomainEvent>;
    return {
      event: parsed.event,
      metadata: {
        ...parsed.metadata,
        timestamp: new Date(parsed.metadata.timestamp),
      },
    };
  }
}

import { DomainEvent } from '../events/domain-event';

export interface RemoteEventPublisher {
  publishToExchange(
    exchangeName: string,
    routingKey: string,
    event: DomainEvent,
  ): Promise<void>;
}

export interface EventBusBridge {
  publishLocally(event: DomainEvent): Promise<void>;
  publishRemotely(event: DomainEvent): Promise<void>;
}

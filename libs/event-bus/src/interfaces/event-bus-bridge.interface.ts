import { DomainEvent } from '../events/domain-event';

export interface RemoteEventPublisher {
  publishToExchange<T extends DomainEvent>(
    exchangeName: string,
    routingKey: string,
    event: T,
  ): Promise<void>;
}

export interface EventBusBridge {
  publishLocally<T extends DomainEvent>(event: T): Promise<void>;
  publishRemotely<T extends DomainEvent>(event: T): Promise<void>;
}

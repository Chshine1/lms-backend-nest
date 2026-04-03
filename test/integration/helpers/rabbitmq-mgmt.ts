export interface RabbitMQQueue {
  name: string;
  vhost: string;
  durable: boolean;
  auto_delete: boolean;
  messages: number;
  messages_ready: number;
  messages_unacknowledged: number;
  consumers: number;
  message_stats?: {
    publish?: number;
    deliver_get?: number;
    deliver_no_ack?: number;
    ack?: number;
  };
}

export interface RabbitMQBinding {
  vhost: string;
  source: string;
  destination: string;
  destination_type: 'queue' | 'exchange';
  routing_key: string;
  arguments: Record<string, unknown>;
}

export interface RabbitMQExchange {
  name: string;
  vhost: string;
  type: 'direct' | 'fanout' | 'topic' | 'headers';
  durable: boolean;
  auto_delete: boolean;
}

export class RabbitMQMgmtClient {
  /** mgmtUrl should include credentials, e.g. http://lms:lms@localhost:15672 */
  constructor(private readonly mgmtUrl: string) {}

  async getQueues(vhost: string = '%2F'): Promise<RabbitMQQueue[]> {
    return this.get<RabbitMQQueue[]>(`/api/queues/${vhost}`);
  }

  async getQueue(name: string, vhost: string = '%2F'): Promise<RabbitMQQueue> {
    return this.get<RabbitMQQueue>(
      `/api/queues/${vhost}/${encodeURIComponent(name)}`,
    );
  }

  async getBindings(vhost: string = '%2F'): Promise<RabbitMQBinding[]> {
    return this.get<RabbitMQBinding[]>(`/api/bindings/${vhost}`);
  }

  async getExchanges(vhost: string = '%2F'): Promise<RabbitMQExchange[]> {
    return this.get<RabbitMQExchange[]>(`/api/exchanges/${vhost}`);
  }

  /** Returns the total number of messages published to a queue since the broker started. */
  async getQueuePublishCount(queueName: string): Promise<number> {
    const q = await this.getQueue(queueName);
    return q.message_stats?.publish ?? 0;
  }

  /** Returns the total number of messages delivered from a queue since the broker started. */
  async getQueueDeliverCount(queueName: string): Promise<number> {
    const q = await this.getQueue(queueName);
    return q.message_stats?.deliver_get ?? 0;
  }

  private async get<T>(path: string): Promise<T> {
    const url = `${this.mgmtUrl}${path}`;
    const response = await fetch(url, {
      headers: { Accept: 'application/json' },
    });
    if (!response.ok) {
      throw new Error(
        `RabbitMQ management API error ${response.status} for ${url}: ${await response.text()}`,
      );
    }
    return await response.json() as Promise<T>;
  }
}

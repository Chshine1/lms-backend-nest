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
  private readonly baseUrl: string;
  private readonly authHeader?: string;

  constructor(mgmtUrl: string) {
    const url = new URL(mgmtUrl);
    const username = url.username;
    const password = url.password;
    if (username && password) {
      const credentials = Buffer.from(`${username}:${password}`).toString('base64');
      this.authHeader = `Basic ${credentials}`;
    }
    this.baseUrl = `${url.protocol}//${url.host}`;
  }

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

  private async get<T>(path: string): Promise<T> {
    const url = `${this.baseUrl}${path}`;
    const headers: HeadersInit = { Accept: 'application/json' };
    if (this.authHeader) {
      headers['Authorization'] = this.authHeader;
    }
    const response = await fetch(url, { headers });
    if (!response.ok) {
      throw new Error(
        `RabbitMQ management API error ${String(response.status)} for ${url}: ${await response.text()}`,
      );
    }
    return (await response.json()) as Promise<T>;
  }
}

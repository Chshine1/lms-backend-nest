# RabbitMQ Module – Public API

## Purpose

Provides RabbitMQ messaging capabilities including connection management, message publishing, consuming, and an outbox pattern for reliable message delivery.

## Exported Services

| Service                     | Description                                                                                                  |
| --------------------------- | ------------------------------------------------------------------------------------------------------------ |
| `RabbitMQConnectionService` | Manages RabbitMQ connection lifecycle (connect, getConnection, close)                                        |
| `RabbitMQChannelService`    | Low-level channel operations (publish, consume, ack, nack, prefetch, assertExchange, assertQueue, bindQueue) |
| `RabbitMQProducerService`   | High-level message publishing with JSON and event helpers                                                    |
| `RabbitMQConsumerService`   | Message consumption with automatic ack/nack                                                                  |
| `RabbitMQOutboxService`     | Outbox pattern implementation for reliable delivery                                                          |

## Exported Types

### Connection Options

```typescript
interface RabbitMQConnectionOptions {
  host: string;
  port: number;
  username: string;
  password: string;
  vhost?: string;
  heartbeat?: number;
  timeout?: number;
}
```

### Exchange Options

```typescript
interface RabbitMQExchangeOptions {
  name: string;
  type: 'direct' | 'fanout' | 'topic' | 'headers';
  durable?: boolean;
  autoDelete?: boolean;
  arguments?: Record<string, unknown>;
}
```

### Queue Options

```typescript
interface RabbitMQQueueOptions {
  name: string;
  durable?: boolean;
  exclusive?: boolean;
  autoDelete?: boolean;
  arguments?: Record<string, unknown>;
}
```

### Binding Options

```typescript
interface RabbitMQBindingOptions {
  source: string;
  target: string;
  routingKey?: string;
  arguments?: Record<string, unknown>;
}
```

### Publish Options

```typescript
interface RabbitMQPublishOptions {
  exchange: string;
  routingKey: string;
  content: Buffer;
  properties?: Partial<RabbitMQMessageProperties>;
}
```

### Message Properties

```typescript
interface RabbitMQMessageProperties {
  contentType?: string;
  contentEncoding?: string;
  headers?: Record<string, unknown>;
  deliveryMode?: 1 | 2;
  priority?: number;
  correlationId?: string;
  replyTo?: string;
  expiration?: string;
  messageId?: string;
  timestamp?: number;
  type?: string;
  userId?: string;
  appId?: string;
}
```

### Consumer Options

```typescript
interface RabbitMQConsumerOptions {
  queue: string;
  handler: (msg: RabbitMQMessage) => Promise<void> | void;
  prefetch?: number;
  noAck?: boolean;
  exclusive?: boolean;
  args?: Record<string, unknown>;
}
```

### Consumer Message

```typescript
interface RabbitMQMessage {
  content: Buffer;
  fields: RabbitMQMessageFields;
  properties: Partial<RabbitMQMessageProperties>;
}

interface RabbitMQMessageFields {
  deliveryTag: number;
  redelivered: boolean;
  exchange: string;
  routingKey: string;
}
```

### Outbox Message

```typescript
interface RabbitMQOutboxMessage {
  id: string;
  exchange: string;
  routingKey: string;
  content: Buffer;
  properties?: Partial<RabbitMQMessageProperties>;
  retryCount: number;
  createdAt: Date;
  processedAt?: Date;
}
```

### Outbox Repository Interface

```typescript
interface OutboxRepository {
  findPending(limit: number): Promise<RabbitMQOutboxMessage[]>;
  markProcessed(id: string): Promise<void>;
  incrementRetry(id: string): Promise<void>;
  save(message: RabbitMQOutboxMessage): Promise<void>;
}
```

## Module Configuration

```typescript
// Module options interface
interface RabbitMQModuleOptions {
  connection: RabbitMQConnectionOptions;
}

// Usage in application
RabbitMQModule.forRoot({
  connection: {
    host: process.env.RABBITMQ_HOST,
    port: parseInt(process.env.RABBITMQ_PORT, 10),
    username: process.env.RABBITMQ_USERNAME,
    password: process.env.RABBITMQ_PASSWORD,
    vhost: process.env.RABBITMQ_VHOST,
    heartbeat: 30,
    timeout: 5000,
  },
});
```

## Usage Examples

### Publishing Messages

```typescript
// Direct publish with options
constructor(private readonly producer: RabbitMQProducerService) {}

async publishMessage() {
  await this.producer.publish({
    exchange: 'events',
    routingKey: 'user.created',
    content: Buffer.from(JSON.stringify({ userId: '123' })),
    properties: {
      contentType: 'application/json',
      correlationId: 'uuid',
    },
  });
}

// Publish JSON (convenience method)
await this.producer.publishJson('events', 'user.created', { userId: '123' });

// Publish event with type and timestamp
await this.producer.publishEvent('events', 'user.created', { userId: '123' });
```

### Consuming Messages

```typescript
constructor(private readonly consumer: RabbitMQConsumerService) {}

async onModuleInit() {
  await this.consumer.startConsuming({
    queue: 'user.created',
    handler: async (msg) => {
      const data = this.consumer.parseMessage<UserEvent>(msg);
      console.log('Received:', data);
    },
    prefetch: 10,
  });
}
```

### Using Outbox Pattern

```typescript
// Configure with outbox repository (e.g., database-backed)
constructor(
  private readonly outboxService: RabbitMQOutboxService,
  private readonly outboxRepo: OutboxRepository,
) {}

// Add message to outbox
const messageId = await this.outboxService.addJsonToOutbox(
  'events',
  'user.created',
  { userId: '123' },
);

// Process outbox (call periodically)
const processed = await this.outboxService.processOutbox(10);

// Start automatic relay
this.outboxService.startRelay(1000); // poll every second
this.outboxService.stopRelay();
```

### Low-Level Channel Operations

```typescript
constructor(private readonly channelService: RabbitMQChannelService) {}

async setup() {
  // Assert exchange
  await this.channelService.assertExchange({
    name: 'events',
    type: 'topic',
    durable: true,
  });

  // Assert queue
  await this.channelService.assertQueue({
    name: 'user.created',
    durable: true,
  });

  // Bind queue
  await this.channelService.bindQueue({
    source: 'events',
    target: 'user.created',
    routingKey: 'user.*',
  });
}
```

## Error Handling

All errors extend `RabbitMQError` which provides standardized error codes:

| Error Class               | Error Code                  | Scenario                      |
| ------------------------- | --------------------------- | ----------------------------- |
| `RabbitMQConnectionError` | `RABBITMQ_CONNECTION_ERROR` | Failed to connect to RabbitMQ |
| `RabbitMQChannelError`    | `RABBITMQ_CHANNEL_ERROR`    | Channel operations fail       |
| `RabbitMQConsumeError`    | `RABBITMQ_CONSUME_ERROR`    | Consumer setup fails          |
| `RabbitMQPublishError`    | `RABBITMQ_PUBLISH_ERROR`    | Message publish fails         |
| `RabbitMQOutboxError`     | `RABBITMQ_OUTBOX_ERROR`     | Outbox operations fail        |

## Notes

- The module is `@Global()` - import once at application root
- Connection and channel are automatically managed with reconnection on error/close
- Consumer automatically handles ack/nack based on handler success
- Outbox service requires a custom repository implementation for production use
- All services are designed for async/await usage

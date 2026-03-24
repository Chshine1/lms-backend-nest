# RabbitMQ Module

## Purpose

Provides a NestJS-integrated RabbitMQ messaging infrastructure with connection management, channel handling, message production, consumption, and an outbox pattern for reliable message delivery.

## Architecture

The module follows a layered architecture:

```
RabbitMQModule
├── RabbitMQConnectionService    - Manages AMQP connection lifecycle
├── RabbitMQChannelService      - Handles channel operations (publish, consume, queue management)
├── RabbitMQProducerService      - High-level message publishing
├── RabbitMQConsumerService     - High-level message consuming
└── RabbitMQOutboxService       - Outbox pattern for reliable delivery
```

The module is marked as `@Global()` so it can be imported once at the application root and all services are available throughout the app.

### Design Decisions

Key architectural decisions are documented in ADRs:

- [ADR 0001: Connection and Channel Lifecycle Management](docs/adr/0001-connection-channel-lifecycle.md) - Describes lazy initialization and auto-reconnect strategy
- [ADR 0002: Transactional Outbox Pattern Implementation](docs/adr/0002-outbox-pattern.md) - Describes the outbox pattern design and trade-offs

### Error Handling

All errors extend `RabbitMQError` which extends `BaseError`:

- `RabbitMQConnectionError` - Connection failures
- `RabbitMQChannelError` - Channel operations (publish, consume, ack, nack, prefetch, assertExchange, assertQueue, bindQueue)
- `RabbitMQConsumeError` - Consumer setup failures
- `RabbitMQPublishError` - Message publishing failures
- `RabbitMQOutboxError` - Outbox operation failures

## File Structure

```
libs/rabbitmq/
├── rabbitmq.module.ts           - NestJS module definition
├── contracts/
│   └── rabbitmq-options.interface.ts - All configuration interfaces
├── errors/
│   ├── rabbitmq.error.ts        - Base error class
│   ├── rabbitmq-connection.error.ts
│   ├── rabbitmq-channel.error.ts
│   ├── rabbitmq-consume.error.ts
│   ├── rabbitmq-publish.error.ts
│   └── rabbitmq-outbox.error.ts
└── services/
    ├── rabbitmq-connection.service.ts
    ├── rabbitmq-channel.service.ts
    ├── rabbitmq-producer.service.ts
    ├── rabbitmq-consumer.service.ts
    ├── rabbitmq-outbox.service.ts
    └── in-memory-outbox.repository.ts
```

## Detailed Design

### Connection Lifecycle

The `RabbitMQConnectionService` manages the AMQP connection lifecycle:

1. **Lazy Initialization**: Connection is established on first `getConnection()` call
2. **Singleton Pattern**: Single connection is reused across all requests
3. **Auto-Reconnect**: Listens for `error` and `close` events, clears connection state to trigger reconnection on next request
4. **Graceful Shutdown**: Implements `OnModuleDestroy` to close connection on application termination

### Channel Lifecycle

The `RabbitMQChannelService` manages channel lifecycle:

1. **Lazy Initialization**: Channel is created on first `getChannel()` call
2. **Singleton Pattern**: Single channel is reused across all operations
3. **Auto-Reconnect**: Listens for `error` and `close` events, clears channel state
4. **Error Isolation**: Each channel operation catches errors and throws typed `RabbitMQChannelError`

### Outbox Pattern

The `RabbitMQOutboxService` implements the transactional outbox pattern for reliable message delivery:

1. **Message Storage**: Messages are first stored in an `OutboxRepository` (in-memory or database-backed)
2. **Async Relay**: Messages are relayed to RabbitMQ asynchronously via `processOutbox()` or automatic relay
3. **Retry Mechanism**: Failed messages are retried up to `maxRetries` (default: 3), then marked as processed
4. **Polling**: The relay polls at configurable intervals (default: 1000ms)

### Consumer Acknowledgment

The `RabbitMQConsumerService` provides automatic ack/nack:

- Successful handler execution → automatic `ack`
- Handler throws error → automatic `nack` (requeue: false)
- Supports prefetch control for flow management

### Error Handling Strategy

All errors extend `RabbitMQError` which provides:

- Standardized error codes from `@app/contracts/errors/error.codes`
- Context-rich error messages (host, port, operation, queue, etc.)
- Chained `cause` for debugging root issues

## Internal Dependencies

- `@app/contracts` - For `BaseError` and error codes
- `amqplib` - AMQP client library

## Coding Conventions

All services implement NestJS dependency injection patterns and follow the project's strict TypeScript configuration. Error classes use the `ErrorCode` enum from contracts for standardized error codes.

## Testing

No tests exist for this module. Tests should follow the pattern defined in `AGENTS.md` using Jest with proper mocking of `amqplib`.

## Local Development

To use this module in an application:

```typescript
// app.module.ts
import { RabbitMQModule } from '@app/infrastructure/modules/rabbitmq/rabbitmq.module';

@Module({
  imports: [
    RabbitMQModule.forRoot({
      connection: {
        host: 'localhost',
        port: 5672,
        username: 'guest',
        password: 'guest',
        vhost: '/',
        heartbeat: 30,
        timeout: 5000,
      },
    }),
  ],
})
export class AppModule {}
```

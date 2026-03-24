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

### Error Handling

All errors extend `RabbitMQError` which extends `BaseError`:

- `RabbitMQConnectionError` - Connection failures
- `RabbitMQChannelError` - Channel operations (publish, consume, ack, nack, prefetch, assertExchange, assertQueue, bindQueue)
- `RabbitMQConsumeError` - Consumer setup failures
- `RabbitMQPublishError` - Message publishing failures
- `RabbitMQOutboxError` - Outbox operation failures

## File Structure

```
libs/infrastructure/src/modules/rabbitmq/
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

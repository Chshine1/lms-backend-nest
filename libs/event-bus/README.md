# Event Bus Library

A simple event bus library for publishing and subscribing to domain events within and across microservices.

## Architecture

The library provides a layered architecture with clear abstractions:

```
┌─────────────────────────────────────────┐
│           Domain Events                 │
│   (AccountCreated, EmailVerified, etc.) │
└─────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────┐
│         Event Bus Service              │
│    (In-memory pub/sub for same-process) │
└─────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────┐
│       Event Publishers                 │
│  ┌─────────────┐  ┌─────────────────┐  │
│  │InMemory     │  │RabbitMQ         │  │
│  │Publisher    │  │Publisher        │  │
│  └─────────────┘  └─────────────────┘  │
└─────────────────────────────────────────┘
```

## Core Concepts

### Domain Events

Domain events are simple classes representing something that happened in the domain:

```typescript
export class AccountCreated {
  eventId!: string;
  eventType!: string;
  occurredAt!: Date;

  constructor(
    public readonly userId: bigint,
    public readonly email: string,
    public readonly tenantId: bigint,
  ) {}
}
```

### Event Bus Service

The `EventBusService` handles in-process event publishing and subscription:

```typescript
@Injectable()
export class UserService {
  constructor(private readonly eventBus: EventBusService) {}

  async createUser(dto: CreateUserDto): Promise<User> {
    const user = await this.userRepo.save(dto);

    const event = createDomainEvent(
      AccountCreated,
      user.id,
      user.email,
      user.tenantId,
    );
    await this.eventBus.publish(event);

    return user;
  }
}
```

### Subscribing to Events

Subscribe to events within the same service:

```typescript
@Injectable()
export class NotificationService {
  constructor(private readonly eventBus: EventBusService) {
    this.eventBus.subscribe(
      AccountCreated,
      this.handleAccountCreated.bind(this),
    );
  }

  private async handleAccountCreated(event: AccountCreated): Promise<void> {
    await this.emailService.sendWelcome(event.email);
  }
}
```

## RabbitMQ Integration

For cross-service communication, use `RabbitMQEventPublisher` and `RabbitMQEventConsumer`.

### Configuration

Add to your config:

```yaml
rabbitmq:
  host: 'localhost'
  port: 5672
  username: 'guest'
  password: 'guest'
  eventExchange: 'domain-events'
  eventQueue: 'user-service-events'
```

### Module Setup

```typescript
@Module({
  imports: [EventBusModule.forRoot({ enableRabbitMQ: true })],
})
export class AppModule {}
```

### Publishing to RabbitMQ

```typescript
@Injectable()
export class UserService {
  constructor(
    private readonly eventBus: EventBusService,
    private readonly rabbitPublisher: RabbitMQEventPublisher,
  ) {}

  async createUser(dto: CreateUserDto): Promise<User> {
    const user = await this.userRepo.save(dto);

    const event = createDomainEvent(
      AccountCreated,
      user.id,
      user.email,
      user.tenantId,
    );

    // Publish locally (same process handlers)
    await this.eventBus.publish(event);

    // Publish to RabbitMQ (other services)
    await this.rabbitPublisher.publish(event);

    return user;
  }
}
```

### Consuming from RabbitMQ

```typescript
@Injectable()
export class AccountEventHandler {
  constructor(private readonly consumer: RabbitMQEventConsumer) {
    this.consumer.registerHandler(
      AccountCreated,
      this.handleAccountCreated.bind(this),
    );
  }

  private async handleAccountCreated(event: AccountCreated): Promise<void> {
    console.log('Received account created event:', event.userId);
  }
}
```

## Testing

The library is designed to be easily testable using the in-memory implementations:

```typescript
describe('UserService', () => {
  let userService: UserService;
  let eventBus: EventBusService;
  let inMemoryPublisher: InMemoryEventPublisher;

  beforeEach(() => {
    eventBus = new EventBusService();
    inMemoryPublisher = new InMemoryEventPublisher();
    userService = new UserService(eventBus, inMemoryPublisher);
  });

  it('should publish event on user creation', async () => {
    const handler = jest.fn();
    eventBus.subscribe(AccountCreated, handler);

    await userService.createUser({ email: 'test@test.com' });

    expect(handler).toHaveBeenCalled();
  });
});
```

## Future Enhancements

The library is designed to support future enhancements:

1. **Transactional Outbox**: Store events in a database table and publish asynchronously
2. **Retry Mechanism**: Add retry logic for failed event deliveries
3. **Event Schema Registry**: Add schema validation for events
4. **Dead Letter Queue**: Handle failed events after max retries

To implement the outbox pattern, you would:

1. Create an `OutboxRepository` interface
2. Add `EventStore` implementation that persists events to DB
3. Create a background worker that polls and publishes pending events
4. Update `EventBusService` to use the store instead of direct publish

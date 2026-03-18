# Event Bus Module

Lightweight event system for inter-module communication.

## Overview

Event-driven communication system that enables loose coupling between modules.

## Key Features

- Minimal dependencies and overhead
- TypeScript support with event type definitions
- Simple publish/subscribe API
- Reduces direct module dependencies
- Extensible for complex event handling

## Architecture

### Core Components

- **EventBusService**: Main service with publish/subscribe methods
- **BootstrapEventBus**: Specialized bus for bootstrap events
- **Event Types**: TypeScript interfaces for type safety

### Event Flow

```
Publisher → Event Bus → Subscribers
```

1. Modules publish events to the bus
2. Bus distributes events to subscribers
3. Subscribers process events asynchronously

## Usage

### Basic Event Publishing

```typescript
import { EventBusService } from '@app/infrastructure';

@Injectable()
export class ConfigService {
  constructor(private eventBus: EventBusService) {}
  
  async loadConfig() {
    const config = await this.loadConfiguration();
    this.eventBus.emit('config.loaded', config);
  }
}
```

### Event Subscription

```typescript
@Injectable()
export class LoggerService {
  constructor(private eventBus: EventBusService) {
    this.eventBus.on('config.loaded', (config) => {
      this.applyConfig(config.logger);
    });
  }
}
```

### Type-Safe Events

```typescript
type AppEvents = {
  'config.loaded': Config;
  'user.created': User;
  'order.completed': Order;
};

const eventBus = new EventBusService<AppEvents>();
```

## Event Types

### Bootstrap Events

Special events used during application initialization:

- **'config.loaded'**: Emitted when configuration is fully loaded
- **'module.ready'**: Emitted when a module completes initialization
- **'app.started'**: Emitted when the application is fully started

### Application Events

Custom events for business logic:

- **'user.registered'**: When a new user registers
- **'payment.processed'**: When a payment is completed
- **'notification.sent'**: When a notification is dispatched

## Implementation Details

### Underlying Library

The module uses the lightweight `mitt` library for event handling, providing:

- Minimal bundle size impact
- High performance
- Simple API surface

### Type Safety

Full TypeScript generics ensure compile-time type checking:

```typescript
// This will cause a TypeScript error if 'user.created' expects User but receives string
eventBus.emit('user.created', 'invalid-data');
```

### Error Handling

- **Event Handler Errors**: Errors in event handlers are caught and logged
- **Missing Handlers**: Events without handlers are silently ignored
- **Circular Events**: Protection against infinite event loops

## Integration Patterns

### Module Initialization

Events are particularly useful for coordinating module initialization:

```typescript
@Injectable()
export class LoggerLoader {
  constructor(private eventBus: BootstrapEventBus) {}
  
  async load(): Promise<void> {
    // Wait for configuration to be loaded
    await this.eventBus.on('config.loaded');
    
    // Apply logger configuration
    this.applyConfig();
    
    // Notify that logger is ready
    this.eventBus.emit('logger.ready');
  }
}
```

### Cross-Module Communication

Events enable communication between modules without direct dependencies:

```typescript
// In User Module
@Injectable()
export class UserService {
  constructor(private eventBus: EventBusService<AppEvents>) {}
  
  async createUser(userData: CreateUserDto): Promise<User> {
    const user = await this.userRepository.create(userData);
    this.eventBus.emit('user.created', user);
    return user;
  }
}

// In Notification Module
@Injectable()
export class NotificationService {
  constructor(private eventBus: EventBusService<AppEvents>) {
    this.eventBus.on('user.created', (user) => {
      this.sendWelcomeEmail(user);
    });
  }
}
```

## Performance Considerations

### Synchronous vs Asynchronous

- **Synchronous Emission**: Events are delivered immediately to subscribers
- **Asynchronous Handling**: Subscribers should handle events asynchronously to avoid blocking

### Memory Usage

- **Event Handlers**: Each subscription adds minimal memory overhead
- **Event Objects**: Event data should be kept lightweight
- **Cleanup**: Unsubscribe from events when no longer needed

### Scalability

For high-volume event scenarios, consider:

- **Event Batching**: Group similar events
- **Debouncing**: Limit event frequency
- **Queue Processing**: Use message queues for high-volume events

## Best Practices

1. **Define Clear Event Contracts**: Document event payloads and semantics
2. **Keep Events Lightweight**: Avoid large payloads in events
3. **Use Descriptive Event Names**: Make event purposes clear
4. **Handle Errors Gracefully**: Ensure event handlers don't crash the application
5. **Test Event Flows**: Write tests for event-driven interactions
6. **Monitor Event Volume**: Watch for event storms or memory leaks

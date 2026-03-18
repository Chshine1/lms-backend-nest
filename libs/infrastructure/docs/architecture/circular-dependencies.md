# Circular Dependencies

## Overview

Circular dependencies between Configuration and Logger systems enable:
- Configuration loading to be logged for debugging
- Logger configuration to be loaded from configuration

## Dependency Flow

```
ConfigurationLoader → LoggerService (for logging)
LoggerLoader → ConfigurationService (for configuration)
ConfigurationService ← ConfigurationLoader (service depends on loader)
```

## Implementation

### Module Dependencies

```typescript
@Module({
  imports: [EventBusModule, forwardRef(() => LoggerModule)],
})
export class ConfigurationModule {}

@Module({
  imports: [EventBusModule, forwardRef(() => ConfigurationModule)],
})
export class LoggerModule {}
```

### Loader Dependencies

```typescript
// ConfigurationLoader uses LoggerService
@Injectable()
export class ConfigurationLoader {
  constructor(
    private readonly loggerService: LoggerService,
    // ... other dependencies
  ) {}
}

// LoggerLoader uses ConfigurationService
@Injectable()
export class LoggerLoader {
  constructor(
    @Inject(forwardRef(() => ConfigurationService))
    private readonly configurationService: ConfigurationService,
    // ... other dependencies
  ) {}
}
```

## Rationale

### Functional Requirements

1. Configuration loading needs logging for debugging
2. Logger needs configuration for log levels and output settings
3. Both systems need coordination during bootstrap

### Alternative Approaches

#### Option 1: Bootstrap Configuration

Separate minimal configuration for bootstrap:
```typescript
class BootstrapConfiguration {
  static getMinimalConfig() {
    return { logLevel: 'info', serviceName: 'bootstrap' };
  }
}
```

**Pros**: Clear initialization sequence
**Cons**: Two configuration systems, increased complexity

#### Option 2: Event-Based Synchronization (Current Choice)

Logger waits for configuration using events:
```typescript
async load(): Promise<void> {
  await this.eventBusService.on('config.loaded');
  this.configurationService.get<LoggerLibConfig>(LoggerLibConfig);
  // ... apply configuration
}
```

**Pros**: Single configuration system, clear coordination
**Cons**: Requires careful error handling

## Technical Implementation

### NestJS forwardRef()

Circular dependencies resolved using `forwardRef()`:
```typescript
@Inject(forwardRef(() => ConfigurationService))
private readonly configurationService: ConfigurationService;
```

### Event-Based Coordination

Events synchronize initialization:
```typescript
// ConfigurationLoader emits when done
this.eventBusService.emit('config.loaded', result);

// LoggerLoader waits for the event
await this.eventBusService.on('config.loaded');
```

## Potential Issues

### Initialization Race Conditions

**Problem**: If configuration loading fails, logger may hang
**Solution**: Timeout and fallback mechanisms

### Partial Functionality

**Problem**: Logger may use incomplete configuration during bootstrap
**Solution**: Default configuration values as fallback

### Debugging Complexity

**Problem**: Difficult to debug initialization issues
**Solution**: Comprehensive logging and clear error messages

## Recommendations

### Short-term

1. Enhanced error handling with timeouts
2. Better logging during initialization
3. Health checking

### Long-term

1. Configuration caching to reduce initialization time
2. Lazy initialization for non-critical components
3. Alternative architectures if issues persist

## Related Documentation

- [Module Initialization](module-initialization.md) - Initialization sequence
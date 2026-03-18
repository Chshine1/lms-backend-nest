# Module Initialization

## Overview

Initialization sequence for the infrastructure module components.

## Initialization Flow

```
1. Application Bootstrap
2. Infrastructure Module Registration
3. Event Bus Initialization
4. Configuration Loading Pipeline
5. Logger System Initialization
6. Module Ready State
```

### Detailed Steps

#### Step 1: Application Bootstrap

```typescript
@Module({
  imports: [InfrastructureModule.forRoot()],
})
export class AppModule {}
```

#### Step 2: Module Registration

NestJS registers InfrastructureModule and dependencies.

#### Step 3: Event Bus Initialization

```typescript
@Module({
  providers: [BootstrapEventBus],
  exports: [BootstrapEventBus],
})
export class EventBusModule {}
```

#### Step 4: Configuration Loading

```typescript
async load(): Promise<void> {
  this.serviceDependencies.configuration = 
    await this.loaderPipelineService.process({});
  this.ready = true;
}
```

#### Step 5: Logger Initialization

```typescript
async load(): Promise<void> {
  await this.eventBusService.on('config.loaded');
  this.configurationService.get<LoggerLibConfig>(LoggerLibConfig);
  this.serviceDependencies.sink = new ConsoleSink('console-sink');
  this.serviceDependencies.buffer = new MemoryBuffer();
  this.ready = true;
}
```

#### Step 6: Ready State

ConfigurationLoader and LoggerLoader set `isReady` flags to true.

## Initialization Coordination

### Event-Based Synchronization

The initialization uses events to coordinate between modules:

```typescript
// ConfigurationLoader emits when done
this.eventBusService.emit('config.loaded', result);

// LoggerLoader waits for the event
await this.eventBusService.on('config.loaded');
```

### Dependency Injection Resolution

NestJS resolves circular dependencies using `forwardRef()`:

```typescript
@Module({
  imports: [forwardRef(() => LoggerModule)],
})
export class ConfigurationModule {}

@Module({
  imports: [forwardRef(() => ConfigurationModule)],
})
export class LoggerModule {}
```

## Error Handling During Initialization

### Configuration Loading Errors

```typescript
// Configuration validation errors
if (validationErrors.length > 0) {
  throw new ConfigurationValidationError(
    `Validation failed for ${cls.name}`,
    validationErrors
  );
}
```

### Logger Initialization Errors

```typescript
// Fallback to default configuration
try {
  await this.waitForConfigWithTimeout(5000);
  this.applyConfig();
} catch (error) {
  this.applyDefaultConfig(); // Graceful degradation
}
```

### Timeout Handling

```typescript
async waitForConfigWithTimeout(timeoutMs: number): Promise<void> {
  return Promise.race([
    this.eventBusService.on('config.loaded'),
    new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Config loading timeout')), timeoutMs)
    )
  ]);
}
```

## Performance Considerations

### Initialization Time

- **Event Bus**: Instant (minimal setup)
- **Configuration Loading**: Depends on sources (env: fast, AWS: slower)
- **Logger Setup**: Fast after configuration is loaded

### Memory Usage

- **Minimal Overhead**: Each module adds minimal memory footprint
- **Buffer Allocation**: Logger buffer allocates memory based on configuration
- **Event Handlers**: Lightweight event subscription model

### Optimization Strategies

1. **Lazy Loading**: Load non-essential components on demand
2. **Caching**: Cache configuration to avoid repeated loading
3. **Parallel Loading**: Load independent components in parallel

## Testing Initialization

### Unit Tests

```typescript
describe('ConfigurationLoader', () => {
  it('should initialize successfully', async () => {
    const loader = new ConfigurationLoader(mockDeps);
    await loader.load();
    expect(loader.isReady).toBe(true);
  });
});
```

### Integration Tests

```typescript
describe('InfrastructureModule Initialization', () => {
  it('should coordinate module initialization', async () => {
    const app = await Test.createTestingModule({
      imports: [InfrastructureModule.forRoot()],
    }).compile();
    
    const configLoader = app.get(ConfigurationLoader);
    const loggerLoader = app.get(LoggerLoader);
    
    expect(configLoader.isReady).toBe(true);
    expect(loggerLoader.isReady).toBe(true);
  });
});
```

### End-to-End Tests

```typescript
describe('Application Bootstrap', () => {
  it('should start with infrastructure services', async () => {
    const app = await NestFactory.create(AppModule);
    await app.init();
    
    // Verify services are available
    const configService = app.get(ConfigurationService);
    const loggerService = app.get(LoggerService);
    
    expect(configService).toBeDefined();
    expect(loggerService).toBeDefined();
  });
});
```

## Monitoring and Observability

### Initialization Metrics

- **Start Time**: When initialization begins
- **Completion Time**: When each module becomes ready
- **Error Count**: Number of initialization failures
- **Duration**: Time taken for complete initialization

### Health Checks

```typescript
@Injectable()
export class InfrastructureHealthIndicator {
  constructor(
    private configLoader: ConfigurationLoader,
    private loggerLoader: LoggerLoader,
  ) {}
  
  async check(): Promise<HealthCheckResult> {
    const details = {
      configuration: { status: this.configLoader.isReady ? 'up' : 'down' },
      logger: { status: this.loggerLoader.isReady ? 'up' : 'down' },
    };
    
    const isHealthy = this.configLoader.isReady && this.loggerLoader.isReady;
    
    return {
      status: isHealthy ? 'ok' : 'error',
      details,
    };
  }
}
```

### Logging During Initialization

```typescript
// Configuration loading logs
await this.loggerService.log({
  level: LogLevel.INFO,
  message: 'Configuration source loaded',
  context: { source: 'environment' }
});

// Logger initialization logs
await this.loggerService.log({
  level: LogLevel.INFO,
  message: 'Logger system initialized',
  context: { sinks: ['console'] }
});
```

## Best Practices

### Initialization Order

1. **Start with Simple Components**: Event bus first
2. **Load Configuration Early**: Configuration before dependent services
3. **Initialize Logging After Configuration**: Logger needs config
4. **Validate Readiness**: Check isReady flags before using services

### Error Recovery

1. **Graceful Degradation**: Continue with reduced functionality
2. **Automatic Retry**: Retry failed initialization
3. **Clear Error Messages**: Provide actionable error information
4. **Health Monitoring**: Continuously monitor service health

### Performance Optimization

1. **Minimize Dependencies**: Keep initialization simple
2. **Use Async Operations**: Avoid blocking during initialization
3. **Cache Results**: Cache expensive operations
4. **Monitor Performance**: Track initialization times

## Troubleshooting

### Common Issues

1. **Circular Dependency Errors**: Check forwardRef() usage
2. **Initialization Timeouts**: Review timeout settings
3. **Configuration Validation Failures**: Verify configuration schemas
4. **Memory Issues**: Check buffer sizes and allocation

### Debugging Tips

1. **Enable Debug Logging**: Add detailed logging during initialization
2. **Use Health Checks**: Implement comprehensive health monitoring
3. **Monitor Metrics**: Track initialization performance metrics
4. **Test Thoroughly**: Ensure comprehensive test coverage

## Related Documentation

- [Circular Dependencies](circular-dependencies.md) - Detailed analysis of dependency management
# Logger Module

Logging system with multiple output sinks, buffering, and structured logging.

## Overview

Structured logging with multiple output destinations, buffering for performance, and extensible middleware.

## Key Features

- Structured logging with JSON format and context
- Multiple sinks: console, file, and custom destinations
- Memory buffering for performance
- Automatic log enrichment with contextual information
- Pluggable sinks, buffers, and middleware

## Architecture

### Core Components

- **LoggerService**: Main logging service interface
- **LoggerLoader**: Handles initialization and configuration
- **LogBuffer**: Interface for buffering implementations
- **Sink**: Interface for output destinations
- **LogEnrichmentService**: Handles log entry enrichment

### Log Flow

```
Log Entry → Enrichment → Buffer → Sink
```

1. Application creates log entry with level, message, context
2. Automatic enrichment with timestamp, service info
3. Temporary storage in memory buffer
4. Writing to configured sinks

## Usage

### Basic Logging

```typescript
import { LoggerService, LogLevel } from '@app/infrastructure';

@Injectable()
export class MyService {
  constructor(private logger: LoggerService) {}
  
  async doWork() {
    await this.logger.log({
      level: LogLevel.INFO,
      message: 'Starting work',
      context: { workId: '123' }
    });
  }
}
```

### Error Logging

```typescript
async handleError(error: Error) {
  await this.logger.log({
    level: LogLevel.ERROR,
    message: 'Operation failed',
    error: error,
    context: { operation: 'database-query' }
  });
}
```

### Custom Log Levels

```typescript
enum CustomLogLevel {
  TRACE = 'trace',
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
  FATAL = 'fatal'
}
```

## Sinks

### Available Sinks

- **ConsoleSink**: Output to console (development)
- **FileSink**: Write to log files
- **ConditionalSink**: Route logs based on conditions
- **FailoverSink**: Fallback to secondary sink on failure
- **MulticastSink**: Send logs to multiple sinks
- **FilterSink**: Filter logs based on criteria
- **ProcessorSink**: Process logs before output
- **NullSink**: Discard logs (testing)

### Custom Sink Implementation

```typescript
import { Sink } from '@app/infrastructure';

export class CustomSink implements Sink {
  async emit(entry: LogEntry): Promise<void> {
    // Custom log output logic
    await this.sendToExternalService(entry);
  }
}
```

## Buffering

### Memory Buffer

The default buffer implementation stores logs in memory and flushes them:
- When the buffer reaches capacity
- On explicit flush() call
- On application shutdown

### Buffer Configuration

```typescript
const buffer = new MemoryBuffer({
  maxSize: 1000,      // Maximum entries in buffer
  flushInterval: 5000 // Auto-flush interval in ms
});
```

## Log Enrichment

### Built-in Enrichment

The LogEnrichmentService automatically adds:
- Timestamp
- Service name and version
- Environment information
- Request correlation IDs (when available)

### Custom Enrichment

```typescript
import { LogEnrichmentService } from '@app/infrastructure';

@Injectable()
export class CustomEnrichmentService {
  async enrich(entry: LogEntry): Promise<LogEntry> {
    return {
      ...entry,
      customField: 'custom-value'
    };
  }
}
```

## Configuration

### Logger Configuration Schema

```typescript
export class LoggerConfig {
  @IsEnum(LogLevel)
  level!: LogLevel;
  
  @IsArray()
  sinks!: SinkConfig[];
  
  @ValidateNested()
  buffer?: BufferConfig;
}
```

### Example Configuration

```yaml
logger:
  level: info
  sinks:
    - type: console
      format: json
    - type: file
      path: /var/log/app.log
      rotation: daily
  buffer:
    type: memory
    maxSize: 1000
    flushInterval: 5000
```

## Performance Considerations

### Asynchronous Logging

All logging operations are asynchronous to avoid blocking the main thread.

### Buffering Strategy

- **Memory Buffer**: Fast but volatile (use for development)
- **File Buffer**: Persistent but slower (use for production)
- **Hybrid Approach**: Memory buffer with periodic file flushing

### Error Handling

- **Sink Failures**: Logs are buffered and retried
- **Buffer Full**: Direct write to sink when buffer is full
- **Graceful Degradation**: System continues operating even if logging fails

## Best Practices

1. **Use Structured Logging**: Always include context for better searchability
2. **Choose Appropriate Log Levels**: Use DEBUG for development, INFO for production
3. **Implement Log Rotation**: Prevent log files from growing indefinitely
4. **Monitor Log Performance**: Watch for buffer overflow and sink performance
5. **Secure Sensitive Data**: Never log passwords, tokens, or sensitive information

## Related Documentation

- [Log Sinks](sinks.md) - Detailed information about sink implementations
- [Log Buffers](buffers.md) - Buffer configuration and performance tuning
- [Log Enrichment](enrichment.md) - Custom enrichment and context management
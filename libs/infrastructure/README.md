# Infrastructure Module

NestJS infrastructure module providing configuration management, logging, and event bus capabilities.

## Overview

Infrastructure module for NestJS applications with three main components:

- **Configuration Module**: Multi-source configuration loading with validation
- **Logger Module**: Structured logging with buffering and multiple output sinks
- **Event Bus Module**: Event system for module communication

### Key Features

- Configuration loading from environment variables, YAML files, and AWS Parameter Store
- Structured logging with memory buffering and console/file output
- Event-based communication for module coordination
- Type-safe configuration and logging APIs

## Architecture

Three main sub-modules:

1. **Configuration Module** - Configuration loading and validation
2. **Logger Module** - Structured logging with sinks and buffers
3. **Event Bus Module** - Module communication through events

### Design Patterns

- Module loader pattern for consistent initialization
- Pipeline pattern for configuration loading
- Strategy pattern for pluggable logging sinks

## Quick Start

### Installation

```bash
npm install @app/infrastructure
```

### Basic Usage

```typescript
import { InfrastructureModule } from '@app/infrastructure';

@Module({
  imports: [InfrastructureModule.forRoot()],
})
export class AppModule {}
```

### Configuration Setup

Create a configuration file `config.yaml`:

```yaml
service:
  name: "my-service"
  port: 3000

logger:
  level: "info"
  sinks:
    - type: "console"
```

## Module Details

For detailed documentation on each module, see:

- [Configuration Module](docs/modules/configuration.md) - Configuration loading and validation
- [Logger Module](docs/modules/logger.md) - Structured logging system
- [Event Bus Module](docs/modules/event-bus.md) - Event-driven communication

## Architecture Decisions

### Circular Dependencies

Circular dependencies between configuration and logging systems enable:

- Configuration loading to be logged for debugging
- Logger configuration to be loaded from configuration

Handled using NestJS `forwardRef()` and event-based synchronization. See [Circular Dependencies](docs/architecture/circular-dependencies.md).

### Configuration Loading Pipeline

Configuration loading order:

1. **Environment Variables** - Highest priority
2. **YAML Files** - Application configuration
3. **AWS Parameter Store** - External configuration

Loaders can depend on configuration from previous loaders.

## API Reference

### Configuration Service

```typescript
const config = configurationService.get(MyConfigClass);
```

### Logger Service

```typescript
await loggerService.log({
  level: LogLevel.INFO,
  message: "Application started",
  context: { service: "my-service" }
});
```

### Event Bus

```typescript
eventBusService.emit('config.loaded', config);
eventBusService.on('config.loaded', (config) => {
  // Handle event
});
```

## Development

### Building the Module

```bash
npm run build:infrastructure
```

### Running Tests

```bash
npm test infrastructure
```

### Code Structure

```
src/
├── modules/
│   ├── configuration/     # Configuration management
│   ├── logger/           # Logging system
│   └── event-bus/        # Event communication
├── configs/              # Default configurations
└── infrastructure.module.ts
```

## Contributing

When contributing to this module:

1. Follow the existing patterns for module loaders and services
2. Maintain type safety with proper TypeScript interfaces
3. Ensure all new features include appropriate tests
4. Update documentation for any changes

## License

This module is part of the LMS Nest Backend project.
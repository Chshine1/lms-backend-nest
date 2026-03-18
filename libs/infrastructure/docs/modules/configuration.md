# Configuration Module

Configuration management system with multiple sources and validation.

## Overview

Loads configuration from environment variables, YAML files, and AWS Parameter Store with validation and type safety.

## Key Features

- Multi-source loading from environment variables, YAML files, AWS Parameter Store
- TypeScript support with class-based schemas
- Validation using class-validator
- Loaders can depend on values from previous loaders
- Extensible middleware pipeline

## Architecture

### Core Components

- **ConfigurationService**: Main service for accessing configuration
- **ConfigurationLoader**: Handles initialization and loading
- **LoaderPipelineService**: Manages loading pipeline
- **LoaderMiddleware**: Interface for configuration sources

### Configuration Loading Pipeline

Loading order:

```typescript
const pipeline = [
  new EnvLoader([], EnvSchema),      // 1. Environment variables
  new YamlLoader([EnvSchema], YamlSchema), // 2. YAML files
  new AwsLoader([EnvSchema, YamlSchema], AwsSchema), // 3. AWS Parameter Store
];
```

Loaders can depend on configuration from previous loaders.

## Usage

### Basic Configuration Access

```typescript
import { ConfigurationService } from '@app/infrastructure';
import { MyConfig } from './my-config.schema';

@Injectable()
export class MyService {
  constructor(private configService: ConfigurationService) {}
  
  getConfig(): MyConfig {
    return this.configService.get(MyConfig);
  }
}
```

### Creating Configuration Schemas

```typescript
import { IsString, IsNumber } from 'class-validator';

export class DatabaseConfig {
  @IsString()
  host!: string;
  
  @IsNumber()
  port!: number;
  
  @IsString()
  database!: string;
}
```

### Custom Configuration Loader

```typescript
import { LoaderMiddlewareBase } from '@app/infrastructure';

export class CustomLoader extends LoaderMiddlewareBase<[]> {
  protected async load(): Promise<Record<string, unknown>> {
    // Load configuration from custom source
    return { custom: 'value' };
  }
}
```

## Configuration Sources

### Environment Variables

Highest priority, loaded first. Supports validation against the `EnvSchema`.

### YAML Files

Application-level configuration. Can depend on environment variables for file paths or other settings.

### AWS Parameter Store

External configuration for cloud deployments. Can depend on both environment variables and YAML configuration.

## Error Handling

The module provides comprehensive error handling:

- **ConfigurationValidationError**: When configuration fails validation
- **ConfigLoadPipelineError**: When the loading pipeline encounters errors
- **GetConfigValidationError**: When accessing invalid configuration

## Advanced Features

### Conditional Configuration Loading

Loaders can implement conditional logic based on environment or other factors.

### Configuration Merging

Configuration from multiple sources is merged, with later sources overriding earlier ones.

# Infrastructure Module – Public API

## Purpose

Provides core cross-cutting infrastructure services for the entire application, including logging and configuration
management. This module is globally available to all apps and libraries.

## Exported Services

### LoggerService

Main logging service for structured logging across the application.

```typescript
export class LoggerService {
  log(params: LogParams): Promise<void>;

  flush(): Promise<void>;
}
```

### ConfigurationService

Service for retrieving and validating application configuration.

```typescript
export class ConfigurationService {
  get<TConfig extends object>(
    cls: new (...args: unknown[]) => TConfig,
  ): TConfig;

  getByKey<TConfig extends object>(
    key: string,
    cls: new (...args: unknown[]) => TConfig,
  ): TConfig;
}
```

## Exported Types

### LogLevel

Enum for log severity levels.

```typescript
export enum LogLevel {
  TRACE = 'trace',
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
  FATAL = 'fatal',
}
```

### LogParams

Parameters for creating a log entry.

```typescript
export interface LogParams {
  level: LogLevel;
  message: string;
  context?: Record<string, unknown>;
  error?: BaseError;
}
```

## Usage Example

### Logger Service

```typescript
import { LoggerService, LogLevel } from '@app/infrastructure/modules/logger/logger.service';

constructor(private
readonly
logger: LoggerService
)
{
}

async
logUserAction(userId
:
number, action
:
string
)
{
  await this.logger.log({
    level: LogLevel.INFO,
    message: `User performed action: ${action}`,
    context: { userId, timestamp: new Date() },
  });
}
```

### Configuration Service

```typescript
import { ConfigurationService } from '@app/infrastructure/modules/configuration/configuration.service';

class AppConfig {
  name!: string;
  port!: number;
  isProduction!: boolean;
}

class DbConfig {
  host!: string;
  port!: number;
}

constructor(private readonly config: ConfigurationService) {
}

setup() {
  const appConfig = this.config.get(AppConfig);
  console.log(`App: ${appConfig.name} on port ${appConfig.port}`);

  const dbConfig = this.config.getByKey('database', DbConfig);
  console.log(`DB: ${dbConfig.host}:${dbConfig.port}`);
}
```

## Module Setup

Import the InfrastructureModule in your root application:

```typescript
import { InfrastructureModule } from '@app/infrastructure/infrastructure.module';

@Module({
  imports: [InfrastructureModule.forRoot()],
})
export class AppModule {}
```

Individual sub-modules can also be imported separately:

```typescript
import { LoggerModule } from '@app/infrastructure/modules/logger/logger.module';
import { ConfigurationModule } from '@app/infrastructure/modules/configuration/configuration.module';

@Module({
  imports: [LoggerModule, ConfigurationModule],
})
export class SomeModule {}
```

## Error Handling

Configuration validation errors are thrown with error code `GET_CONFIG_VALIDATION_ERROR`:

```typescript
import { GetConfigValidationError } from '@app/infrastructure/modules/configuration/configuration.errors';
```

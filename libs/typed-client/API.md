# Typed Client – Public API

## Purpose

Provides a type-safe RPC client for calling microservices over RabbitMQ. Consumers use typed clients to invoke remote procedures with full type safety on request and response payloads.

## Exported Services

### TypedClientBase

Abstract base class for typed clients. Provides RPC and publish methods.

**Type Parameters:**

- `TPatterns` - Record mapping pattern names to `{ request: TRequest; response: TResponse }`

**Methods:**

- `protected rpc<T extends keyof TPatterns>(pattern: T, data: TPatterns[T]['request']): Promise<TPatterns[T]['response']>` - Makes an RPC call and waits for response
- `protected publish<T extends keyof TPatterns>(pattern: T, data: TPatterns[T]['request']): Promise<void>` - Publishes a message without waiting for response

**Properties:**

- `protected readonly exchange: string` - The RabbitMQ exchange name
- `protected readonly timeout: number` - RPC timeout in milliseconds (default: 30000)

### UserTypedClient

Example typed client implementation for user-service. Exposes user operations as typed methods.

**Methods:**

- `createUser(data: CreateUserDto): Promise<UserContract>` - Creates a new user
- `validateUser(data: ValidateUserDto): Promise<UserContract | null>` - Validates user credentials
- `findUserById(id: number): Promise<UserContract | null>` - Finds a user by ID

## Exported Types

### TypedClientMqOptions

Configuration options for the typed client module.

```typescript
interface TypedClientMqOptions {
  exchange: string;
  timeout?: number;
}
```

### ExtractController<T>

Utility type that extracts public methods from a typed client, excluding base class methods.

```typescript
type ExtractController<TTypedClient extends TypedClientBase> = Omit<
  TTypedClient,
  keyof TypedClientBase
>;
```

### UserPatterns

Pattern definitions for user-service RPC calls. Defines request and response types for each pattern.

```typescript
interface UserPatterns extends Record<
  string,
  { request: unknown; response: unknown }
> {
  'user.create': { request: CreateUserDto; response: UserContract };
  'user.validate': { request: ValidateUserDto; response: UserContract | null };
  'user.findById': { request: { id: number }; response: UserContract | null };
}
```

## Usage Example

```typescript
// module.ts
import { TypedClientModule } from '@app/typed-client/typed-client.module';
import { UserTypedClient } from '@app/typed-client/clients/user.typed-client';

@Module({
  imports: [
    TypedClientModule.forFeature({
      mqOptions: { exchange: 'user-service', timeout: 5000 },
      clients: [UserTypedClient],
    }),
  ],
  providers: [UserTypedClient],
  exports: [UserTypedClient],
})
export class UserModule {}

// service.ts
@Injectable()
export class SomeService {
  constructor(private readonly userClient: UserTypedClient) {}

  async findUser(id: number): Promise<UserContract | null> {
    return await this.userClient.findUserById(id);
  }
}
```

## Configuration

The typed client module requires:

| Option     | Type   | Required | Description                                   |
| ---------- | ------ | -------- | --------------------------------------------- |
| `exchange` | string | Yes      | RabbitMQ exchange name for the target service |
| `timeout`  | number | No       | RPC timeout in milliseconds (default: 30000)  |

## Error Handling

RPC calls may throw errors from `@golevelup/nestjs-rabbitmq`:

- Connection failures
- Timeout errors
- Channel errors

Consumers should handle these errors appropriately with try-catch blocks.

## Notes

- Typed clients are typically used in gateway or other microservices that need to communicate with the target service
- The module is marked as `@Global()`, so it only needs to be imported once at the application root
- Each service should define its own patterns in contracts and implement a typed client

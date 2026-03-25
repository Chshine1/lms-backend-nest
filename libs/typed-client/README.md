# Typed Client

## Purpose

Provides a type-safe RPC client pattern for microservices communication over RabbitMQ. Enables services to call other microservices with full type safety on request and response payloads.

## Architecture

The library follows a pattern-based RPC architecture:

```
TypedClientModule (@Global())
├── TypedClientBase         - Abstract base class with rpc() and publish() methods
├── ExtractController<T>   - Utility type for extracting public client methods
├── TypedClientMqOptions    - Configuration interface (exchange, timeout)
└── UserTypedClient         - Example concrete implementation for user-service
```

### How It Works

1. **Pattern Definition**: Define message patterns with request/response types
2. **Client Extension**: Extend `TypedClientBase<TPatterns>` and implement typed methods
3. **Module Registration**: Register clients via `TypedClientModule.forFeature()`
4. **Dependency Injection**: Inject the typed client and call methods with full type safety

### Design Decisions

The typed client pattern ensures:

- Compile-time type checking for RPC calls
- Centralized pattern definitions in contracts
- Consistent RPC/publish behavior across all clients

## File Structure

```
libs/typed-client/
├── src/
│   ├── typed-client.module.ts       - NestJS module definition
│   ├── typed-client.base.ts         - Abstract base class with rpc/publish
│   ├── types/
│   │   └── extract-controller.ts   - Utility type for client extraction
│   ├── patterns/
│   │   └── user.patterns.ts         - Example pattern definitions
│   └── clients/
│       └── user.typed-client.ts     - Example typed client implementation
```

## Internal Dependencies

- `@app/contracts` - For DTOs and entity contracts
- `@golevelup/nestjs-rabbitmq` - For AMQP connection
- `@app/infrastructure` - For base infrastructure

## Coding Conventions

All typed clients must:

- Extend `TypedClientBase<TPatterns>`
- Implement methods that call `this.rpc(pattern, data)` or `this.publish(pattern, data)`
- Use pattern definitions from contracts for type safety
- Be registered via `TypedClientModule.forFeature()`

## Testing

Tests should follow the pattern defined in `AGENTS.md` using Jest with proper mocking of `AmqpConnection`.

## Local Development

To create a new typed client for a microservice:

```typescript
// 1. Define patterns in contracts
// patterns/user.patterns.ts
export interface UserPatterns {
  'user.create': { request: CreateUserDto; response: UserContract };
}

// 2. Extend TypedClientBase
// clients/user.typed-client.ts
@Injectable()
export class UserTypedClient extends TypedClientBase<UserPatterns> {
  createUser(data: CreateUserDto): Promise<UserContract> {
    return this.rpc('user.create', data);
  }
}

// 3. Register in module
TypedClientModule.forFeature({
  mqOptions: { exchange: 'user-service' },
  clients: [UserTypedClient],
});
```

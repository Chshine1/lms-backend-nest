# Plan: Typed-Client Module Migration to golevelup/nestjs-rabbitmq

## Overview

This plan outlines the migration of the existing typed-client pattern from `@nestjs/microservices` to `@golevelup/nestjs-rabbitmq`, enabling type-safe RPC communication across microservices using RabbitMQ.

## Current State

- **Existing Library**: `libs/typed-client` uses `ClientProxy` from `@nestjs/microservices`
- **Pattern**: `TypedClientBase` with generic type constraints for request/response
- **Usage**: `UserTypedClient` extends base class with concrete service patterns

## Target State

- New typed-client implementation using `@golevelup/nestjs-rabbitmq`'s `RabbitMQModule`
- Type-safe RPC clients that use RabbitMQ request-reply pattern
- Backward compatibility layer (optional, for gradual migration)

## Implementation Steps

### Phase 1: Foundation (Week 1)

1. **Create new library structure**
    - Location: `libs/rabbitmq-typed-client/src/`
    - Module: `RabbitMQTypedClientModule`
    - Export: Typed client classes and utilities

2. **Implement base classes**
    - `RabbitMQTypedClientBase<TPatterns>` - generic base for all typed clients
    - Support both fire-and-forget (publish) and RPC (request-reply) patterns
    - Use `AmqpConnection` from golevelup for publishing

3. **Define pattern types**
    - Extend existing contract patterns from `@app/contracts`
    - Add pattern metadata for RabbitMQ exchange/routing key configuration

### Phase 2: Consumer Support (Week 2)

1. **Add RPC server-side support**
    - Decorator-based handlers using `@golevelup/nestjs-rabbitmq` features
    - Type-safe controller wrappers that parse and validate incoming messages

2. **Create migration utilities**
    - Helper functions to convert existing `@MessagePattern` handlers
    - Type-safe decorator factories

### Phase 3: Migration (Week 3-4)

1. **Migrate existing typed-clients**
    - Convert `libs/typed-client/src/user.typed-client.ts`
    - Add other service clients as needed

2. **Update service controllers**
    - Replace `@MessagePattern` with RabbitMQ decorators
    - Ensure pattern definitions are consistent between client and server

3. **Update module configurations**
    - Configure exchanges, queues, and bindings
    - Set up dead-letter queues for failed messages

### Phase 4: Testing & Documentation (Week 5)

1. **Integration tests**
    - Test RPC request-reply
    - Test fire-and-forget messaging
    - Test error handling and timeouts

2. **Documentation**
    - Update `API.md` for new typed-client library
    - Create migration guide for existing services

## Key Design Decisions

### Pattern 1: RPC Client (Request-Reply)

```typescript
class CourseTypedClient extends RabbitMQTypedClientBase<CoursePatterns> {
  async findCourseById(id: number): Promise<CourseContract | null> {
    return this.rpc('course.findById', { id }, 'course.service');
  }
}
```

### Pattern 2: Event Publisher (Fire-and-forget)

```typescript
class NotificationPublisher extends RabbitMQEventPublisher<NotificationEvents> {
  async publishCourseCreated(event: CourseCreatedEvent): Promise<void> {
    return this.publish('course.created', event);
  }
}
```

## Dependencies

- `@golevelup/nestjs-rabbitmq` (already installed)
- `amqplib` (already installed)
- `@app/contracts` (existing pattern definitions)

## Risks & Mitigations

| Risk                      | Impact | Mitigation                                      |
| ------------------------- | ------ | ----------------------------------------------- |
| Breaking existing clients | High   | Maintain dual support during migration          |
| Performance regression    | Medium | Benchmark and optimize connection pooling       |
| Message schema changes    | Medium | Versioned contracts with backward compatibility |

## Success Criteria

- [ ] All inter-service communication uses RabbitMQ (not REST where inappropriate)
- [ ] Type-safe client abstractions prevent request/response mismatches
- [ ] Zero runtime errors due to pattern type mismatches
- [ ] Integration tests pass for all RPC and event patterns
- [ ] Documentation complete with usage examples

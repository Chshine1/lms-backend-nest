# ADR 0006: RabbitMQ Message Queue Pattern for Microservices Communication

## Status

Proposed

## Context

The project is a NestJS microservices monorepo. Currently, some microservices still use general RESTful controller declarations (`@Controller()` with `@Get()`, `@Post()`, etc.) instead of message-based communication. This inconsistency creates:

- Mixed communication patterns across services
- Inability to leverage asynchronous messaging benefits
- Poor separation between services
- Difficulty in scaling and maintaining service boundaries

## Decision

All microservices **must** communicate using a message queue pattern based on RabbitMQ, unless explicitly specified otherwise.

### Communication Patterns

#### 1. Message Queue Pattern (Default)

For fire-and-forget operations that do not require a response:

- Use one-way message publishing to topic exchanges
- Messages are published to named exchanges with routing keys
- No expectation of response from the consuming service

#### 2. RPC Pattern (Request-Response)

For operations that require a response:

- Use request-reply pattern with reply-to queues
- Include correlationId for tracking
- Set appropriate timeout for response handling

### Implementation Library

Use `@golevelup/nestjs-rabbitmq` for:

- RabbitMQ connection management
- Message consuming (using `@RabbitSubscribe` or `@RabbitRPC` decorators)
- Request-reply pattern support

### Type-Safe Producer Pattern

All service-to-service communication **must** use type-safe producers:

- Define message patterns with strict request/response types in `@app/contracts`
- Create typed client wrappers that encapsulate producer logic
- Use generic base classes to enforce type safety at compile time

Example pattern structure:

```
{
  "pattern_name": {
    request: RequestType;
    response: ResponseType | null;
  }
}
```

### Exception: RESTful Controllers

Only the following may use RESTful patterns:

- Gateway service (acts as API entry point)
- External-facing APIs that require HTTP protocol
- Services explicitly documented as HTTP-only

All internal service-to-service communication **must** use RabbitMQ.

## Consequences

### Positive

- Consistent asynchronous communication across all services
- Better decoupling between services
- Improved scalability through message buffering
- Built-in message acknowledgment and retry mechanisms
- Type-safe client abstractions prevent runtime errors
- Clear distinction between synchronous (RPC) and asynchronous (queue) operations

### Negative

- Migration effort required for existing RESTful controllers
- Additional complexity in handling message failures and retries
- Need for proper message schema versioning strategy
- Additional infrastructure requirement (RabbitMQ cluster)

## Compliance

- Code review: reject new RESTful controller endpoints in microservices unless exempted
- Linting: verify all inter-service communication uses typed clients
- AI assistants: enforce RabbitMQ pattern for all new microservice integrations
- Testing: include integration tests for message queue communication
- Documentation: keep contracts (pattern definitions) synchronized with implementations

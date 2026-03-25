# Architecture Overview

This document provides a high-level overview of the LMS Backend NestJS architecture.

## Monorepo Structure

```
apps/
├── gateway/           # API Gateway (REST entry point)
├── user-service/      # User management microservice
└── course-service/    # Course management microservice

libs/
├── audit/             # Audit logging
├── authentication/    # Auth and permissions
├── contracts/        # Shared interfaces and DTOs
├── health/           # Health checks
├── infrastructure/   # Shared infrastructure
└── typed-client/     # Typed clients for cross-service communication
```

## Key Architectural Patterns

### 1. Entity-Contract Separation

**Reference**: [ADR 0007](./adr/0007-entity-contract-separation.md)

Entities in `apps/*/entities` must implement contracts from `libs/contracts`:

- **Contracts**: DTOs for data transmission with class-transformer
- **Entities**: TypeORM-decorated classes implementing contracts
- Use `implements`, not `extends`

### 2. Controller-Typed-Client Alignment

**Reference**: [ADR 0008](./adr/0008-controller-typed-client-alignment.md)

Controllers in microservices must implement typed clients from `libs/typed-client`:

- **Typed Client**: Client-side RPC interface
- **Controller**: Server-side RPC handlers implementing the typed client
- Use `implements ExtractController<TypedClient>`

### 3. Microservices Communication

Services communicate via RabbitMQ RPC:

- Typed clients use `AmqpConnection.rpc()` for request-response
- Controllers use `@RabbitRPC` decorator for handling requests
- All communication uses contracts for type safety

## Data Flow

```
Client → Gateway → Typed Client → RabbitMQ → Controller → Service → Entity → Database
                                              ↑
                                    Contract (DTO)
```

## Related ADRs

- [0001: Centralized Infrastructure Usage](./adr/0001-centralized-infrastructure-usage.md)
- [0003: Uniform DDD Pattern](./adr/0003-uniform-ddd-pattern.md)
- [0006: RabbitMQ Message Queue Pattern](./adr/0006-rabbitmq-message-queue-pattern.md)
- [0007: Entity-Contract Separation](./adr/0007-entity-contract-separation.md)
- [0008: Controller-Typed-Client Alignment](./adr/0008-controller-typed-client-alignment.md)

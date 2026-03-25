# ADR 0007: Entity-Contract Separation

## Status

Accepted

## Context

In a microservices architecture with shared contract libraries, we need clear boundaries between:

- **Entities**: Database-specific classes with TypeORM decorators, storing actual data
- **Contracts**: Data transmission objects (DTOs) with class-transformer for serialization/exclusion

The challenge is maintaining type safety while allowing flexibility in both layers.

## Decision

1. **Contract classes** must be defined in `libs/contracts` as concrete classes (not interfaces)
   - Use `class-transformer` decorators (`@Expose()`) for field visibility control
   - Use `class-validator` decorators for input validation on DTOs
   - Serve as the canonical data shape for cross-service communication

2. **Entity classes** must be defined in `apps/*/entities` and **IMPLEMENT** their corresponding contracts
   - Use `implements` keyword, NOT `extends`
   - Entity carries TypeORM decorators (`@Entity`, `@Column`, etc.)
   - Entity adds database-specific fields (e.g., `passwordHash`)

3. **The contract defines the public interface; the entity provides the implementation**
   - Contract fields are a subset (excluding secrets)
   - Entity may have additional private fields not exposed in contract

## Consequences

### Positive

- Clear separation of concerns between persistence and transmission
- Automatic exclusion of sensitive fields via class-transformer
- Type safety enforced at compile time
- Contracts are reusable across services for cross-service calls

### Negative

- Duplicate field definitions (must keep contract and entity in sync)
- Requires discipline to update contracts when entities change

## Compliance

- All entities in `apps/*/entities` must implement contracts from `libs/contracts`
- Use `implements`, never `extends`, for contract relationships
- Contracts must use `@Expose()` for all fields that should be transmitted
- Code review: verify entity-contract alignment

# ADR 0003: Uniform Domain-Driven Design Pattern for Microservices

## Status

Accepted

## Context

In a microservices architecture, each business service must model its domain effectively to ensure consistency,
maintainability, and clear boundaries. Without a common DDD pattern, services may diverge in structure, making
cross-service understanding, refactoring, and onboarding difficult. A uniform DDD approach provides a shared vocabulary,
consistent architecture, and explicit boundaries between services.

## Decision

All microservice applications in this project must follow a uniform **Domain-Driven Design (DDD)** pattern, unless
explicitly specified otherwise. The DDD pattern establishes a clear structure for modeling business concepts, enforcing
business rules, and organizing code.

### Core DDD Concepts

Each business microservice must define and maintain:

1. **Aggregates**: A cluster of related entities and value objects that form a transactional consistency boundary.
   Aggregates encapsulate business invariants and are the primary unit of persistence and retrieval.

2. **Entities**: Objects with a distinct identity that runs through time and different representations. Entities have
   lifecycle methods and state transitions that must respect business rules.

3. **Value Objects**: Immutable objects that are defined by their attributes rather than a unique identity. Value
   objects are used to model concepts that are defined by their attributes.

4. **Domain Events**: Events that represent something significant that happened in the domain. Domain events capture the
   history of business occurrences and enable event-driven communication between aggregates.

5. **Business Invariants**: Rules that must always hold true within the domain. Invariants define what makes the
   business consistent and valid, and they must be enforced at the appropriate level (entity, aggregate, or domain
   service).

6. **Domain Services**: Services that represent operations or actions that do not naturally belong to a single entity or
   value object. Domain services orchestrate complex operations across multiple aggregates or entities.

### Documentation Requirement

Each business microservice application (located in `apps/`) must contain a `DOMAIN.md` file that documents the domain
model following the structure defined in `DOCUMENTATION_STANDARDS.md`. The documentation must accurately reflect the
current state of the domain implementation.

### Exceptions

- **Gateway service**: As an orchestration layer that primarily handles routing, validation, and cross-service
  composition, the gateway service is exempt from the full DDD pattern. It may document its API contracts and routing
  logic instead.
- **Explicit deviations**: Any service that requires a different architectural pattern must document the deviation in
  its module-level ADR.

## Consequences

### Positive

- **Consistency**: All business services follow the same architectural pattern, making cross-service understanding
  easier.
- **Clear boundaries**: DDD aggregates define explicit transactional boundaries, reducing implicit coupling.
- **Shared vocabulary**: Domain events and terminology create a common language across teams and services.
- **Enforced business rules**: Invariants ensure that business constraints are respected throughout the codebase.
- **Better onboarding**: New developers can apply DDD knowledge across all services.

### Negative

- **Initial overhead**: Teams must learn and apply DDD concepts consistently.
- **Over-engineering risk**: Simple services may not need the full DDD structure, but must still follow the pattern.

## Compliance

- Each business microservice in `apps/` must have a `DOMAIN.md` file following the template in
  `DOCUMENTATION_STANDARDS.md`.
- Code reviews should verify that domain concepts (aggregates, entities, value objects) are properly identified and
  documented.
- Domain events must be registered in the service's event catalog if they are used for inter-aggregate communication.
- Invariants must be enforced at the appropriate level (entity, aggregate, or domain service), not delegated to
  application services.

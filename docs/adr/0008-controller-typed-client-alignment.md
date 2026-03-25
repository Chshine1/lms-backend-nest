# ADR 0008: Controller-Typed-Client Alignment

## Status

Accepted

## Context

In our microservices architecture, cross-service communication uses typed clients. The challenge is ensuring that:

- The typed client accurately represents the controller's API
- Changes to the controller are reflected in the typed client
- Type safety is maintained across service boundaries

## Decision

1. **Typed clients** must be defined in `libs/typed-client/src/clients/` for each microservice
   - Each typed client extends `TypedClientBase` with pattern definitions
   - Pattern definitions in `libs/typed-client/src/patterns/` define request/response types

2. **Controllers** in microservices (except gateway) must **IMPLEMENT** the typed client
   - Use `implements ExtractController<TypedClient>` to derive controller type
   - This ensures the controller implements all RPC methods defined in the typed client

3. **The typed client defines the contract; the controller provides the implementation**
   - Typed client methods map to controller RPC handlers
   - Both share the same request/response types from contracts

## Consequences

### Positive

- Compile-time verification of controller-typed-client alignment
- Self-documenting API contracts
- Easy to discover all available RPC endpoints
- Type safety for cross-service calls

### Negative

- Additional boilerplate for each service
- Must update both controller and typed client when adding endpoints

## Compliance

- All microservices (except gateway) must have corresponding typed clients
- Controllers must implement `ExtractController<TypedClient>`
- Use patterns from `libs/typed-client/src/patterns/` for RPC definitions
- Reference: `apps/user-service` for implementation example

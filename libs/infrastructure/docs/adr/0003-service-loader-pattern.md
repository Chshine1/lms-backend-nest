# ADR 0003: Service Loader Pattern for Infrastructure

## Status

Accepted

## Context

Each infrastructure service needs a way to expose a stable public interface while allowing its internal implementation to evolve during the bootstrapping process. The service loader pattern provides this capability by separating the service's public API from its internal dependencies, making it easy to replace dependencies without changing the service's contract.

## Decision

Each infrastructure will follow the service loader pattern with these requirements:

1. **Service Exposure**: The service is exposed outside the module without revealing how its implementation changes over time. Consumers interact with a stable interface.

2. **Loader-Managed Dependencies**: The loader is responsible for replacing the service's dependencies during the bootstrapping process. The service itself does not manage or care about how dependencies are implemented.

3. **Clear & Configurable Dependencies**: Service dependencies should be:
   - Explicitly defined as interfaces or configuration objects
   - Easy to replace by the loader without modifying the service
   - Encapsulated so the service doesn't need to know the implementation details

4. **Dependency Injection**: The service receives its dependencies through constructor injection (or equivalent), allowing the loader to provide different implementations at different bootstrapping stages.

5. **Loader Responsibilities**:
   - Initialize dependencies in the correct order
   - Replace dependencies as the bootstrapping progresses
   - Ensure dependencies are ready before the service attempts to use them

## Consequences

### Positive

1. **Encapsulation**: Service consumers are protected from internal implementation changes
2. **Flexibility**: Dependencies can be swapped easily during bootstrapping without service changes
3. **Testability**: Services can be tested with mock dependencies
4. **Clear Contracts**: Dependencies are explicitly defined as interfaces, making contracts clear

### Negative

1. **Indirection**: Additional layers may make debugging slightly more complex
2. **Loader Complexity**: The loader must understand dependency ordering and replacement logic
3. **Interface Stability**: Public interfaces must remain stable even as internal implementations change

## Compliance

- Each infrastructure service must define clear dependency interfaces
- Loaders must be documented with the dependency order they manage
- Services must not contain logic to create or resolve their own dependencies
- Integration tests should verify that loaders correctly replace dependencies at each stage

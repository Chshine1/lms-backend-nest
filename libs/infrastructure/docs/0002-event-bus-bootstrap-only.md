# ADR 0002: Event Bus – Bootstrap-Only Module

## Status

Accepted

## Context

The event bus module is designed to facilitate communication between submodules during the infrastructure bootstrapping
phase. However, using an event bus as a general communication mechanism throughout the application lifecycle introduces
unnecessary complexity and tight coupling. We need to clarify the scope and lifecycle of the event bus to ensure it
serves its purpose without becoming a persistent architectural burden.

## Decision

The event bus module will be used exclusively during the bootstrap stage with the following constraints:

1. **Minimal Implementation**: The event bus must be as simple as possible, only supporting the communication needs
   between submodules during bootstrapping. It should not evolve into a full-featured message bus.

2. **Not Exported in Main Module**: The event bus will NOT be exported in the main `InfrastructureModule` exports. It
   exists only as an internal bootstrap mechanism.

3. **Released After Bootstrap**: Once all infrastructures are loaded and the bootstrapping phase completes, the event
   bus should be completely released. This means:
    - Event handlers are cleared
    - References are released to allow garbage collection
    - The module is not available for runtime communication

4. **Scope Limitation**: The event bus is only for submodules' communication during bootstrap. It should not be used
   for:
    - Application-level event handling
    - Cross-service communication
    - Runtime state management

## Consequences

### Positive

1. **Simplified Bootstrap**: Submodules can communicate loosely during initialization without direct dependencies
2. **Clean Lifecycle**: No residual event bus artifacts after bootstrapping completes
3. **Performance**: No overhead from event bus in production runtime
4. **Clarity**: Clear distinction between bootstrap concerns and runtime concerns

### Negative

1. **Limited Reusability**: Cannot leverage event bus for other purposes if needed later
2. **Migration Effort**: If event-driven patterns are needed in the future, must implement separate solution

## Compliance

- The event bus service must not be added to the `exports` array of `InfrastructureModule`
- Documentation should clearly state the bootstrap-only nature of the event bus
- Code reviews must ensure event bus is not used for runtime communication

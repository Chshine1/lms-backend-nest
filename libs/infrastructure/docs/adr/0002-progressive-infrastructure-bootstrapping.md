# ADR 0003: Progressive Infrastructure Bootstrapping

## Status

Accepted

## Context

Circular dependencies are an inherent challenge in infrastructure design. While it is impossible to completely resolve all circular dependencies, we can manage them through a progressive bootstrapping process. The goal is to start with simpler dependencies and progressively enhance them as the bootstrapping proceeds.

## Decision

Infrastructure bootstrapping will follow a progressive enhancement pattern with these constraints:

1. **Single Service Wrapper**: The bootstrapping process is wrapped in a single service registered in the IOC container at the beginning. The steps are not separated into different services.

2. **Inner Implementation Evolution**: Only the inner implementation changes over time; the external interface remains uniform throughout the bootstrapping process.

3. **Unified Interface**: The service exposes a consistent interface regardless of its current bootstrapping stage. Consumers do not need to know which stage the infrastructure is in.

4. **Unified Responsibility**: By keeping the entire bootstrapping logic in one service, we avoid splitting responsibilities across multiple services. This makes it easier to merge stages after bootstrapping is complete.

5. **Progressive Enhancement Steps**:
   - **Stage 1 (Basic)**: Initialize with minimal dependencies that have no circular references
   - **Stage 2 (Enhanced)**: Add intermediate dependencies that depend on Stage 1
   - **Stage 3 (Full)**: Initialize all remaining dependencies, resolving any circular references through the progressive setup

## Consequences

### Positive

1. **No Split Responsibilities**: The entire bootstrapping logic stays in one place, making it easier to understand and maintain
2. **Uniform Interface**: Consumers interact with a consistent API throughout and after bootstrapping
3. **Flexible Resolution**: Circular dependencies are resolved progressively as more infrastructure becomes available
4. **Easy Merging**: No need to merge separate services after bootstrapping since everything was in one service from the start

### Negative

1. **Complex Initial Code**: The bootstrapping service may contain more logic initially than if split across services
2. **Testing Complexity**: Testing each stage may require more setup than testing isolated services
3. **Debugging**: Understanding which bootstrapping stage is active may require more logging

## Compliance

- The bootstrapping service must implement a stable interface from the first stage
- Each stage should be clearly documented in code comments
- Integration tests should verify the full bootstrapping sequence
- The service should expose its current stage for debugging purposes

# ADR 0004: Sink-Buffer Architecture for Logging

## Status

Accepted

## Context

Logging requires flexibility in how log entries are routed, processed, and stored. A rigid logging implementation makes it difficult to:

- Switch between output destinations without code changes
- Add multiple output targets simultaneously
- Handle failures gracefully with fallback mechanisms
- Filter or transform logs based on conditions

We need a composable architecture that allows building complex logging pipelines from simple, reusable components.

## Decision

The logging system follows a **Sink-Buffer Architecture**:

### Core Contracts

- **Sink**: An abstraction for log output destinations. Sinks accept log entries and handle emission to their target (console, file, remote service, etc.).
- **LogBuffer**: An intermediate storage layer that buffers log entries before flushing to sinks.

### Composability Pattern

Sinks are composable through wrapper sinks that delegate to other sinks:

- **Broadcasting**: A sink that emits to multiple child sinks simultaneously
- **Failover**: A sink that attempts emission through a sequence of sinks, stopping at the first success
- **Filtering**: A sink that conditionally passes entries based on predicates
- **Transformation**: A sink that modifies entries before delegation

This pattern follows the **Decorator Pattern**: wrapper sinks add behavior without modifying the underlying sink interface.

### Buffer-First Strategy

Logs are written to a buffer first. The buffer determines whether to hold entries (e.g., batching) or pass them directly to the sink. This decouples log production from sink latency.

### Error Chaining

When a sink chain fails, errors propagate upward through wrapper sinks. Each wrapper captures its own context and attaches it to the error, forming a trace of the complete failure path through the composition.

## Consequences

### Positive

1. **Composability**: Complex logging pipelines built from simple, testable components
2. **Flexibility**: Easily add/remove/swap sinks without changing core logging code
3. **Resilience**: Failover patterns ensure logs aren't lost on transient failures
4. **Debuggability**: Error traces clearly identify where the pipeline broke
5. **Testability**: Each sink type can be unit tested in isolation

### Negative

1. **Indirection**: Multiple layers may obscure the actual logging destination
2. **Performance**: Composite patterns add overhead
3. **Complexity**: More sink types means more test surface area

## Compliance

- All sinks must implement a uniform interface accepting log entries
- Wrapper sinks must propagate errors with their own context attached
- The logging service must use a buffer-first strategy
- Integration tests should verify failover behavior

# ADR 0001: Connection and Channel Lifecycle Management

## Status

Accepted

## Context

RabbitMQ connections and channels are inherently stateful and can fail due to network issues, broker restarts, or protocol errors. The module needs to handle these failures gracefully without requiring manual intervention or application restarts.

## Decision

The module implements a lazy initialization pattern with automatic reconnection for both connections and channels:

1. **Lazy Initialization**: Connections and channels are created only when first needed, not at startup. This avoids unnecessary resource consumption when RabbitMQ is temporarily unavailable during startup.

2. **Singleton Pattern**: Each service maintains a single connection/channel instance. All operations share this instance, reducing resource overhead.

3. **Event-Based Reconnection**: Both connection and channel services listen to `error` and `close` events from amqplib. When an event is received, the local reference is set to `null`. The next operation will trigger a fresh connection/channel creation.

4. **Graceful Shutdown**: Connection service implements `OnModuleDestroy` to ensure proper cleanup on application termination.

### Why Not Full Reconnection Logic?

Instead of implementing automatic reconnection with retry logic, backoff, and maximum retry attempts, the module relies on:

- **Idempotent Operations**: RabbitMQ operations like `assertExchange`, `assertQueue`, and `bindQueue` are idempotent. Re-executing them after reconnection is safe.
- **Publisher Confirms**: Not implemented in this version. Applications requiring guaranteed delivery should use the outbox pattern.
- **Application-Level Retry**: Consumers can implement their own retry logic in message handlers.

## Consequences

### Positive

- Simple implementation with minimal code complexity
- Automatic recovery from transient failures without explicit reconnection calls
- Lazy initialization reduces startup dependencies

### Negative

- First operation after a failure may be slow (reconnection + operation)
- No connection pooling or load balancing across multiple connections
- No automatic retry with backoff for initial connection failures

## Compliance

- All service classes must maintain nullable private fields for connection/channel
- Event listeners must clear state on error/close
- Connection service must implement `OnModuleDestroy` for cleanup

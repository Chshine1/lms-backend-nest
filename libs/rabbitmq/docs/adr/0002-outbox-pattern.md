# ADR 0002: Transactional Outbox Pattern Implementation

## Status

Accepted

## Context

In distributed systems, reliably delivering messages to RabbitMQ is challenging. Simply publishing messages within a database transaction is not reliable—if the message is published but the transaction fails and rolls back, the message exists in RabbitMQ without corresponding database state. Conversely, if the database commits but the RabbitMQ publish fails, the message is lost.

## Decision

The module implements the transactional outbox pattern:

1. **Two-Step Process**: Messages are first stored in an outbox table (repository), then asynchronously relayed to RabbitMQ. This decouples the database commit from message publishing.

2. **Outbox Repository Interface**: The `OutboxRepository` interface defines the contract for storage implementations:
   - `findPending(limit)`: Retrieve unprocessed messages
   - `markProcessed(id)`: Mark message as successfully delivered
   - `incrementRetry(id)`: Increment retry counter for failed messages
   - `save(message)`: Store a new message

3. **Built-in Implementations**:
   - `InMemoryOutboxRepository`: For development/testing purposes
   - Custom implementations can be provided for production (e.g., database-backed)

4. **Relay Mechanism**:
   - Manual: Call `processOutbox(limit)` periodically
   - Automatic: `startRelay(interval)` starts a polling interval

5. **Retry Strategy**:
   - Failed messages retry up to `maxRetries` (default: 3)
   - After exceeding max retries, messages are marked as processed (moved to dead letter in production implementations)

### Why Polling Instead of Event-Based?

The outbox service uses polling rather than database triggers or transaction log tailing because:

- Simpler implementation without external dependencies
- Works with any database that supports the outbox repository interface
- No coupling to specific database features (like PostgreSQL LISTEN/NOTIFY)
- Polling interval is configurable for different throughput requirements

## Consequences

### Positive

- Guarantees at-least-once delivery: messages are persisted before attempted delivery
- Decouples database transactions from message publishing
- Supports any storage backend via repository interface
- Automatic retry with configurable limits
- Simple, observable polling mechanism

### Negative

- Eventual consistency: messages are not delivered instantly
- Requires additional infrastructure: outbox table/repository
- Duplicate delivery possible: if relay crashes after publish but before markProcessed
- Polling overhead: may not be suitable for ultra-low-latency requirements

## Compliance

- Outbox service must expose both manual (`processOutbox`) and automatic (`startRelay`/`stopRelay`) relay options
- Repository interface must support all four operations
- Retry logic must respect configurable `maxRetries` limit
- Processed messages must be marked to prevent duplicate delivery

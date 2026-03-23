# ADR 0001: File Service Storage Abstraction

## Status

Accepted (Implemented)

## Implementation Notes

The storage abstraction has been implemented with the following components:

1. **IStorageProvider interface**: Defined in `storage/storage-provider.interface.ts`
2. **LocalStorageProvider**: Local filesystem implementation
3. **S3StorageProvider**: AWS S3 implementation with signed URLs
4. **Factory provider**: Module uses configuration to select the appropriate provider at runtime

Configuration is managed through `@app/infrastructure` ConfigurationService, following ADR 0001 (Centralized Infrastructure Usage).

## Context

The File Service needs to support multiple storage backends (local filesystem, S3, etc.) without requiring code changes in the service layer. Additionally, we need to generate signed URLs for secure file access that work consistently regardless of the underlying storage provider.

## Decision

We will implement a **storage abstraction layer** using the Strategy pattern:

1. **Storage Provider Interface**: Define a common interface (`IStorageProvider`) that all storage implementations must follow
2. **Provider Registration**: Storage providers are registered via configuration and can be swapped without code changes
3. **Signed URL Generation**: Each provider implements its own signed URL logic while exposing a common interface
4. **Fallback Strategy**: Default to local filesystem; throw clear error if configured provider is unavailable

## Consequences

### Positive

- Storage backends can be swapped via configuration
- New storage providers can be added without modifying existing code
- Testing can use in-memory or mock providers
- Signed URLs work consistently across providers

### Negative

- Additional abstraction adds complexity
- Some provider-specific features may not map cleanly to the interface

## Compliance

- All storage operations must go through the `IStorageProvider` interface
- Signed URLs must be generated with configurable expiration
- Provider implementations must handle their own error types that map to common error codes

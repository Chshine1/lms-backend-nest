# ADR 0005: Centralized File Service with Domain-Specific Associations

## Status

Proposed

## Context

The system needs to handle file uploads, storage, and retrieval across multiple business domains (e.g., user avatars,
product images, course materials). Each domain has different metadata requirements for file associations, but all files
share common attributes (storage location, content attributes, audit fields). We need an architecture that:

- Maintains consistent file metadata across all domains
- Allows domain-specific association attributes (e.g., order, captions, primary flags)
- Keeps domain services independent from storage implementation details
- Provides secure access through signed URLs

## Decision

We will implement a **centralized File Service** with **domain-specific association tables**:

1. **Central File Table**: A dedicated table owned by the File Service stores common file metadata:
    - Storage reference (key/path)
    - Content attributes (type, size)
    - Audit fields (created_by, created_at, updated_at, deleted_at)

2. **Domain-Specific Association Tables**: Each business domain maintains its own association table that references the
   central File table. These tables contain domain-specific columns appropriate to their context (e.g., display order,
   primary flags, descriptive metadata).

3. **Service Responsibilities**:
    - **File Service**: Handles storage, URL signing, and central file metadata management
    - **Domain Services**: Manage business rules around file associations and domain-specific metadata

4. **Access Pattern**: Clients obtain signed URLs from the File Service on-demand rather than direct file exposure

## Consequences

### Positive

- **Single Responsibility**: File Service owns storage and metadata; domain services own business rules
- **Flexibility**: Each domain can add custom columns without affecting other domains
- **Data Consistency**: Central table enforces uniform audit fields across all files
- **Scalability**: Domain services remain independent; can scaleFile Service separately
- **Security**: Signed URLs prevent direct file exposure; time-limited access
- **Clean Deletion**: Support for soft delete with cascading or background cleanup strategies

### Negative

- **Cross-Service Complexity**: When services have separate databases, they cannot directly join association tables with
  the central File table, requiring additional network hops
- **Transaction Consistency**: Creating a file requires both central metadata and association record; failures can leave
  orphaned files without careful handling (transactions or saga pattern)

### Alternatives Considered

A single polymorphic table with `entity_type` and `entity_id` columns was considered but rejected because:

- Custom columns for specific entities require making all columns nullable, reducing clarity
- Query complexity increases and indexes become less efficient
- Foreign key constraints cannot reference multiple parent tables in standard SQL

## Compliance

- File Service must provide signed URL generation with configurable expiration
- All file metadata must go through the central File table
- Domain services must not bypass File Service for file operations
- Soft delete must be implemented for the central File table
- Storage abstraction must allow future migration between storage backends without API changes

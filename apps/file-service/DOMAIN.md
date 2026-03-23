# Domain Model – File Service

## Overview

The File Service provides centralized file storage and management for the entire LMS platform. It handles file uploads,
metadata persistence, storage backend abstraction, and secure access through signed URLs. The service owns the central
file metadata and delegates domain-specific associations to business domain services.

## Aggregates

### File (Root Aggregate)

The File entity is the root aggregate that encapsulates all file metadata and serves as the consistency boundary for
file operations.

**Responsibilities:**

- Manage file identity and metadata
- Store and retrieve file content reference (storage key)
- Track content attributes (type, size, checksum)
- Enforce audit fields across all files
- Manage soft-delete lifecycle

**Invariants:**

- Storage key must be unique
- File must have valid content type
- Size must be positive and within configured limits

## Entities

### File

**Identity:** `id` (auto-generated), `storageKey` (unique)

**Attributes:**

| Field       | Type   | Description                        |
|-------------|--------|------------------------------------|
| storageKey  | string | Unique path/key in storage backend |
| contentType | string | MIME type (e.g., "image/png")      |
| size        | number | File size in bytes                 |
| checksum    | string | Content hash (MD5/SHA256)          |
| createdBy   | number | User ID who uploaded the file      |
| createdAt   | Date   | Upload timestamp                   |
| updatedAt   | Date   | Last modification timestamp        |
| deletedAt   | Date   | Soft delete timestamp              |

**Lifecycle:**

- Created when file is uploaded
- Updated when metadata changes
- Soft-deleted (marks deletedAt); actual file removed by background process

**Invariants:**

- Storage key must be unique system-wide
- Content type must be in allowed list
- Size cannot exceed configured maximum

## Value Objects

### StorageRef

Represents a reference to stored file content.

**Attributes:**

- `provider`: string (e.g., "local", "s3")
- `bucket`: string (storage bucket name)
- `key`: string (path within bucket)
- `url`: string (direct access URL, if applicable)

### SignedUrl

Represents a time-limited access URL.

**Attributes:**

- `url`: string (the signed URL)
- `expiresAt`: Date (expiration timestamp)
- `method`: string (HTTP method allowed, typically "GET")

## Domain Events

| Event Name      | Trigger              | Data Payload                                |
|-----------------|----------------------|---------------------------------------------|
| `file.uploaded` | File created         | `{ fileId, storageKey, contentType, size }` |
| `file.deleted`  | File soft-deleted    | `{ fileId, deletedBy }`                     |
| `file.accessed` | Signed URL generated | `{ fileId, expiresAt, ipAddress }`          |

## Business Invariants

1. **Unique Storage Key**: Each file must have a unique storage key within the system.
2. **Content Type Validation**: Uploaded files must have an allowed content type.
3. **Size Limit**: File size cannot exceed configured maximum (per file and per user).
4. **Audit Trail**: All file operations must record user ID and timestamp.
5. **Soft Delete**: Files are never hard-deleted; `deletedAt` is set and cleanup happens asynchronously.
6. **Signed URL Expiry**: Generated URLs must have configurable expiration; default to 1 hour.

## Domain Services

### FileManagementService

**Responsibilities:**

- Create file records after upload
- Retrieve file metadata
- Manage file lifecycle (soft delete)
- List files with filters

**Operations:**

- `createFile(dto: CreateFileDto): Promise<File>`
- `getFile(id: number): Promise<File>`
- `listFiles(filters: FileFilters): Promise<File[]>`
- `deleteFile(id: number, userId: number): Promise<void>`

### StorageService

**Responsibilities:**

- Abstract storage operations
- Upload file content to storage backend
- Delete file content from storage
- Generate pre-signed URLs

**Operations:**

- `upload(stream: Readable, options: UploadOptions): Promise<StorageRef>`
- `delete(storageKey: string): Promise<void>`
- `generateSignedUrl(storageKey: string, expiresIn: number): Promise<SignedUrl>`

### UrlSigningService

**Responsibilities:**

- Generate time-limited signed URLs
- Validate and verify signed URLs
- Revoke active signed URLs

**Operations:**

- `sign(storageKey: string, expiresIn: number): Promise<SignedUrl>`
- `verify(signedUrl: string): boolean`

## Relationships

```
File (1) ──────< (N) DomainAssociation
DomainAssociation: Domain-specific tables (e.g., course_materials, user_avatars)
```

**Note**: Domain-specific associations are owned by business services (e.g., course-service manages course materials,
user-service manages avatars). The File Service only owns the central `files` table.

## Notes

- The File Service does not own domain-specific associations; these are managed by respective business services
- Storage backend is abstracted to support local filesystem, S3, or other providers
- Signed URLs provide security by limiting access time and optionally IP address
- Background cleanup job handles physical deletion of soft-deleted files
- This service follows the platform/domain service pattern in DDD, providing infrastructure capabilities to business
  domains

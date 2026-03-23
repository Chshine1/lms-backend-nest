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
| ----------- | ------ | ---------------------------------- |
| id          | number | Auto-generated primary key         |
| storageKey  | string | Unique path/key in storage backend |
| contentType | string | MIME type (e.g., "image/png")      |
| size        | number | File size in bytes                 |
| checksum    | string | Content hash (MD5/SHA256)          |
| createdBy   | number | User ID who uploaded the file      |
| createdAt   | Date   | Upload timestamp                   |
| updatedAt   | Date   | Last modification timestamp        |
| deletedAt   | Date   | Soft delete timestamp              |
| version     | number | Optimistic locking version         |

**Lifecycle:**

- Created when file is uploaded
- Updated when metadata changes
- Soft-deleted (marks deletedAt); actual file removed from storage immediately

**Invariants:**

- Storage key must be unique system-wide
- Content type must be in allowed list
- Size cannot exceed configured maximum

## Value Objects

### StorageRef

Represents a reference to stored file content.

**Attributes:**

- `key`: string (path within storage)
- `url`: string (direct access URL, if applicable)

### SignedUrl

Represents a time-limited access URL.

**Attributes:**

- `url`: string (the signed URL)
- `expiresAt`: Date (expiration timestamp)

## Domain Events

| Event Name      | Trigger              | Data Payload                                |
| --------------- | -------------------- | ------------------------------------------- |
| `file.uploaded` | File created         | `{ fileId, storageKey, contentType, size }` |
| `file.deleted`  | File soft-deleted    | `{ fileId, deletedBy }`                     |
| `file.accessed` | Signed URL generated | `{ fileId, expiresAt }`                     |

## Business Invariants

1. **Unique Storage Key**: Each file must have a unique storage key within the system.
2. **Content Type Validation**: Uploaded files must have an allowed content type.
3. **Size Limit**: File size cannot exceed configured maximum (per file and per user).
4. **Audit Trail**: All file operations must record user ID and timestamp.
5. **Soft Delete**: Files are never hard-deleted; `deletedAt` is set and file content is removed from storage.
6. **Signed URL Expiry**: Generated URLs must have configurable expiration; default to 1 hour (3600 seconds).

## File Creation Flow

When a file is created, the following operations occur in sequence:

1. **File Upload**: The client sends a multipart/form-data request with the file binary and a `CreateFileDto` (containing `checksum` and `createdBy`).

2. **Storage Upload**: The `FileService` streams the file to the storage provider (local or S3). The storage provider returns a unique `storageKey` that identifies the file in the storage backend.

3. **Metadata Creation**: A `File` entity is created with:
   - `storageKey`: The key returned by the storage provider
   - `contentType`: MIME type from the uploaded file
   - `size`: Size in bytes from the uploaded file
   - `checksum`: From the client's DTO
   - `createdBy`: User ID from the client's DTO

4. **Persistence**: The file entity is saved to the database, establishing the link between metadata and the actual stored file.

The storage operation happens first to ensure the file is successfully stored before creating database records. If storage fails, no database record is created.

## Domain Service

### FileService

**Responsibilities:**

- Create file records after upload
- Retrieve file metadata
- Manage file lifecycle (soft delete)
- Generate signed URLs for file access

**Operations:**

- `createFile(dto: CreateFileDto, file: Express.Multer.File): Promise<FileContract>`
- `getFile(id: number): Promise<FileContract>`
- `deleteFile(id: number, userId: number): Promise<void>`
- `generateSignedUrl(fileId: number, expiresIn?: number): Promise<SignedUrlResult>`

## Storage Abstraction

The storage layer is abstracted via the `IStorageProvider` interface. The provider is selected via configuration:

### IStorageProvider

**Operations:**

- `upload(stream: Readable, options: UploadOptions): Promise<{ key: string; url?: string }>`
- `delete(key: string): Promise<void>`
- `generateSignedUrl(key: string, expiresIn: number): Promise<{ url: string; expiresAt: Date }>`
- `getPublicUrl(key: string): string`

### LocalStorageProvider

Default implementation using local filesystem. Stores files in a configurable path with date-based organization.

**Configuration:**

- `storagePath`: Base path for file storage
- `provider`: Set to `'local'` to use this provider

### S3StorageProvider

AWS S3 implementation for cloud storage.

**Configuration:**

- `provider`: Set to `'s3'` to use this provider
- `s3.bucket`: S3 bucket name
- `s3.region`: AWS region
- `s3.accessKeyId`: AWS access key (optional, uses IAM role if not provided)
- `s3.secretAccessKey`: AWS secret key (optional)
- `s3.endpoint`: Custom S3-compatible endpoint (optional)
- `s3.signedUrlExpiry`: Signed URL expiry in seconds

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
- Signed URLs provide security by limiting access time
- File content is deleted from storage when file is soft-deleted
- This service follows the platform/domain service pattern in DDD, providing infrastructure capabilities to business
  domains

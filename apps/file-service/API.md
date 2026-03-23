# File Service – Public API

## Purpose

Centralized file management service providing file upload, storage, metadata management, and secure access through
signed URLs.

## Exported Services

### FileService

Main service for file operations. Provides full file lifecycle management.

```typescript
export class FileService {
  createFile(dto: CreateFileDto): Promise<FileContract>;
  
  getFile(id: number): Promise<FileContract>;
  
  deleteFile(id: number, userId: number): Promise<void>;
  
  generateSignedUrl(
    fileId: number,
    expiresIn?: number,
  ): Promise<SignedUrlResult>;
}
```

## Exported Types

### FileContract

File information entity.

```typescript
class FileContract {
  id!: number;
  storageKey!: string;
  contentType!: string;
  size!: number;
  checksum!: string;
  createdBy!: number;
  createdAt!: Date;
  updatedAt!: Date;
  deletedAt?: Date;
  version!: number;
}
```

### SignedUrlResult

Signed URL with expiration.

```typescript
class SignedUrlResult {
  url!: string;
  expiresAt!: Date;
}
```

### CreateFileDto

DTO for creating a new file record.

```typescript
class CreateFileDto {
  storageKey!: string;
  contentType!: string;
  size!: number;
  checksum!: string;
  createdBy!: number;
}
```

## REST Endpoints

| Method | Path                  | Description                  |
|--------|-----------------------|------------------------------|
| POST   | /files                | Create a new file record     |
| GET    | /files/:id            | Get file metadata by ID      |
| DELETE | /files/:id            | Delete file (soft delete)    |
| GET    | /files/:id/signed-url | Generate signed URL for file |

## Usage Example

```typescript
import { FileService } from '@app/file-service/src/file-service.service';

constructor(private readonly fileService: FileService) {}
```

## Configuration

Configuration options:

- `STORAGE_PROVIDER`: Storage backend type (local, s3, etc.)
- `STORAGE_PATH`: Base path for file storage (via StorageConfig)
- `SIGNED_URL_EXPIRY`: Default expiration time for signed URLs (in seconds), defaults to 3600

## Error Handling

Service uses NestJS exceptions:

- `NotFoundException`: File does not exist
- Standard TypeORM errors for database operations

## Storage Abstraction

The service uses an `IStorageProvider` interface that can be implemented by different storage backends:

- `LocalStorageProvider`: Local filesystem storage
- Future: S3, Azure Blob, etc.

## Notes

- File records are soft-deleted (deletedAt timestamp)
- Actual file content is deleted from storage when file is deleted
- Signed URLs are time-limited and expire based on configured expiry

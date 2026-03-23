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

The service uses centralized configuration from `@app/infrastructure`. Configuration is loaded from environment
variables.

### StorageConfig

| Environment Variable | Type   | Description                       |
|----------------------|--------|-----------------------------------|
| STORAGE_PATH         | string | Base path for local file storage  |
| PROVIDER             | string | Storage provider type (local, s3) |

### S3Config (when PROVIDER=s3)

| Environment Variable | Type   | Description                   |
|----------------------|--------|-------------------------------|
| S3_BUCKET            | string | S3 bucket name                |
| S3_REGION            | string | AWS region                    |
| S3_ACCESS_KEY_ID     | string | AWS access key (optional)     |
| S3_SECRET_ACCESS_KEY | string | AWS secret key (optional)     |
| S3_ENDPOINT          | string | Custom S3 endpoint (optional) |
| S3_SIGNED_URL_EXPIRY | number | Signed URL expiry in seconds  |

### FileConfig

| Environment Variable | Type   | Description                          |
|----------------------|--------|--------------------------------------|
| SIGNED_URL_EXPIRY    | number | Default signed URL expiry in seconds |

## Error Handling

Service uses NestJS exceptions:

- `NotFoundException`: File does not exist
- Standard TypeORM errors for database operations

## Storage Abstraction

The service uses an `IStorageProvider` interface that can be implemented by different storage backends. The provider is
selected via configuration:

- `LocalStorageProvider`: Local filesystem storage (default)
- `S3StorageProvider`: AWS S3 storage (when `provider: 's3'`)

## Notes

- File records are soft-deleted (deletedAt timestamp)
- Actual file content is deleted from storage when file is deleted
- Signed URLs are time-limited and expire based on configured expiry

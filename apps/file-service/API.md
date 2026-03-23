# File Service – Public API

## Purpose

Centralized file management service providing file upload, storage, metadata management, and secure access through
signed URLs.

## Exported Services

### FileService

Main service for file operations. Currently, provides basic functionality; will be extended to support full file
lifecycle management.

```typescript
export class FileServiceService {
  getHello(): string;
}
```

## Exported Types

No public types currently exported. Future versions will export:

- `FileMetadata`: File information (id, storage key, content type, size, audit fields)
- `SignedUrlResult`: Signed URL with expiration
- `UploadResult`: Upload response with file metadata

## Usage Example

```typescript
import { FileServiceService } from '@app/file-service/src/file-service.service';

constructor(private
readonly
fileService: FileServiceService
)
{
}
```

**Note**: The service is currently a placeholder. Full API will be implemented in future iterations.

## Configuration

Configuration will include:

- `STORAGE_PROVIDER`: Storage backend type (local, s3, etc.)
- `STORAGE_PATH`: Base path for file storage
- `SIGNED_URL_EXPIRY`: Default expiration time for signed URLs (in seconds)

## Error Handling

Service will use error codes from `@app/contracts/errors`:

- `FILE_NOT_FOUND`: Requested file does not exist
- `FILE_UPLOAD_FAILED`: File upload operation failed
- `SIGNED_URL_GENERATION_FAILED`: Failed to generate signed URL
- `INVALID_FILE_TYPE`: File type not allowed

## Notes

- This is an early implementation; full feature set will be built out progressively
- Storage abstraction layer will be added to support multiple backends
- Integration with domain-specific association tables will be implemented by domain services

# File Service

## Purpose

Centralized file storage and management service that handles file uploads, metadata storage, and secure access through
signed URLs for the entire LMS platform.

## Architecture

The File Service follows the architecture defined
in [ADR 0005: Centralized File Service with Domain-Specific Associations](../../docs/adr/0005-centralized-file-service.md).

### Design Principles

- **Central File Metadata**: All files share a common metadata table for consistent audit fields and storage references
- **Domain-Specific Associations**: Business domains maintain their own association tables with domain-specific columns
- **Signed URL Access**: Clients obtain time-limited signed URLs rather than direct file exposure
- **Storage Abstraction**: Storage backend is abstracted to allow future migration

### Key Components

- **FileController**: REST endpoints for file operations
- **FileService**: Core business logic for file management
- **Storage Provider**: Abstract storage layer (S3, local, etc.)

### File Creation Flow

1. Client uploads file via multipart/form-data with `checksum` and `createdBy`
2. FileService streams file to storage provider → receives `storageKey`
3. FileService creates File entity with metadata and saves to database

## File Structure

```
apps/file-service/
├── src/
│   ├── file.module.ts              # Module definition
│   ├── file.controller.ts          # HTTP endpoints
│   ├── file.service.ts            # Core business logic
│   ├── main.ts                    # Service entry point
│   ├── entities/
│   │   └── file.entity.ts         # File entity
│   └── storage/
│       ├── storage-provider.interface.ts  # Storage abstraction interface
│       └── providers/
│           ├── local-storage.provider.ts   # Local filesystem storage implementation
│           └── s3-storage.provider.ts      # S3 storage implementation
├── docs/                          # Documentation
├── API.md                         # Public API contract
├── DOMAIN.md                      # Domain model
└── README.md                      # This file
```

## Internal Dependencies

- **@app/infrastructure**: Logging and configuration services
- **@app/contracts**: Shared interfaces and error codes
- **@app/audit**: Audit logging integration

## Coding Conventions

Follows the project-wide conventions defined in `AGENTS.md`. No additional module-specific rules.

## Testing

Unit tests should cover:

- File upload and storage operations
- Signed URL generation and validation
- Association management

## Local Development

```bash
yarn build file-service   # Build the service
yarn start:dev            # Run with hot reload (from root)
```

The service runs as a microservice and communicates via message patterns with other services.

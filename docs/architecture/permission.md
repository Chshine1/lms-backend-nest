## Permission System Implementation

### 1. Overview

Following ADR-001, permissions are decentralized: the user service provides identity and basic attributes (e.g., user
type, tenant membership), while each business service manages its own fine-grained permissions. This document describes
the implementation details including the data model, caching strategy, and permission checking flow that all business
services should implement.

### 2. Data Model

Each business service maintains a permission table as defined in ADR-001. The table uses a composite primary key
`(user_id, resource, action)` and soft deletes. Example schema for a `document` service:

```sql
CREATE TYPE document_resource AS ENUM ('document', 'folder');
CREATE TYPE document_action AS ENUM ('read', 'write', 'delete', 'share');

CREATE TABLE document_permissions
(
    user_id    bigint            NOT NULL,
    resource   document_resource NOT NULL,
    action     document_action   NOT NULL,
    created_at timestamptz       NOT NULL DEFAULT now(),
    deleted_at timestamptz,
    PRIMARY KEY (user_id, resource, action)
);
```

**Table Naming Convention**: `{service_name}_permissions` (e.g., `document_permissions`, `comment_permissions`).

**Column Design**:

- `user_id` (`bigint`): Identifier of the user, part of composite primary key.
- `resource` (`enum`): The resource type, defined as an enum in the service (e.g., `document`, `folder`).
- `action` (`enum`): The action, defined as an enum per service (e.g., `read`, `write`, `delete`).
- `created_at` (`timestamptz`): Timestamp of permission creation.
- `deleted_at` (`timestamptz`): Soft delete marker; `NULL` means active, non-null means revoked.

**Design Notes**:

- Omit `updated_at` and `version` columns because permission rows are immutable once inserted.
- The composite primary key `(user_id, resource, action)` prevents duplicate active permissions without extra
  application logic.

### 3. Caching Strategy

To reduce database load, each business service may cache permission checks in Redis.

**Cache Key Pattern**: `permission:{user_id}:{resource}:{action}`

**Cache Value**: `1` if permission exists and is active (non-deleted), or `null`/absent if no active permission.

**TTL**: Recommended 3600 seconds (1 hour), configurable per service based on traffic patterns.

### 4. Permission Checking Flow

Services expose an internal endpoint (e.g., `GET /internal/permissions/check?user_id=...&resource=...&action=...`) for
synchronous checks. The implementation follows these steps:

1. Check Redis cache using key `permission:{user_id}:{resource}:{action}`. If present and not expired, return the
   result (true/false based on existence of active row).
2. If cache miss, query the database:
   `SELECT 1 FROM permissions WHERE user_id = $1 AND resource = $2 AND action = $3 AND deleted_at IS NULL LIMIT 1`.
3. Store the result in Redis with a TTL (e.g., 3600 seconds).
4. Return the result.

### 5. Granting and Revoking Permissions

**Grant Permission**: Insert a new row with `deleted_at = NULL`. If a soft-deleted row already exists, update it by
setting `deleted_at = NULL` and `created_at = now()` (or simply re-insert – the choice depends on whether you want to
keep the original creation timestamp).

**Revoke Permission**: Set `deleted_at = now()` on the active row.

**Cache Invalidation**: After any modification, invalidate the corresponding Redis cache key(s). For a grant/revoke of
a specific `(user, resource, action)`, invalidate `permission:{user}:{resource}:{action}`. Optionally, if a bulk
operation
affects multiple permissions, you can use cache keys with wildcards or simply clear all permission keys for that user
(trade-off between simplicity and cache efficiency).

### 6. Implementation Checklist

- [ ] Define enums for resource types in the service (e.g., `DocumentResource`, `CommentResource`).
- [ ] Define enums for actions in the service (e.g., `DocumentAction`, `CommentAction`).
- [ ] Create permission table with composite primary key and soft delete column.
- [ ] Implement internal permission check endpoint.
- [ ] Configure Redis caching with appropriate TTL.
- [ ] Implement cache invalidation on grant/revoke operations.
- [ ] Write unit tests for permission service logic.

### 7. Summary

The combination of a decentralized permission model and a uniform, simple data structure ensures that each service
remains autonomous while following a consistent pattern. The use of enums, composite keys, soft deletes, and Redis
caching provides both correctness and performance without unnecessary complexity.

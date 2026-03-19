## Permission System Design

### 1. Overview

Following ADR-001, permissions are decentralized: the user service provides identity and basic attributes (e.g., user
type, tenant membership), while each business service manages its own fine‑grained permissions. This document describes
the common data model, caching strategy, and permission checking flow that all business services should implement.

### 2. Data Model

Each business service maintains a permission table as defined in ADR‑002. The table uses a composite primary key
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

### 3. Permission Checking

Services expose an internal endpoint (e.g., `GET /internal/permissions/check?user_id=...&resource=...&action=...`) for
synchronous checks. The implementation follows these steps:

1. Check Redis cache using key `permission:{user_id}:{resource}:{action}`. If present and not expired, return the
   result (true/false based on existence of active row).
2. If cache miss, query the database:  
   `SELECT 1 FROM permissions WHERE user_id = $1 AND resource = $2 AND action = $3 AND deleted_at IS NULL LIMIT 1`.
3. Store the result in Redis with a TTL (e.g., 3600 seconds).
4. Return the result.

### 4. Granting and Revoking Permissions

- **Grant**: Insert a new row with `deleted_at = NULL`. If a soft‑deleted row already exists, update it by setting
  `deleted_at = NULL` and `created_at = now()` (or simply re‑insert – the choice depends on whether you want to keep the
  original creation timestamp).
- **Revoke**: Set `deleted_at = now()` on the active row.
- After any modification, invalidate the corresponding Redis cache key(s). For a grant/revoke of a specific
  `(user, resource, action)`, invalidate `permission:{user}:{resource}:{action}`. Optionally, if a bulk operation
  affects multiple permissions, you can use cache keys with wildcards or simply clear all permission keys for that
  user (trade‑off between simplicity and cache efficiency).

### 5. Summary

The combination of a decentralized permission model and a uniform, simple data structure ensures that each service
remains autonomous while following a consistent pattern. The use of enums, composite keys, soft deletes, and Redis
caching provides both correctness and performance without unnecessary complexity.
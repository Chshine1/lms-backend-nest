## ADR-001: Decentralized Permission Model

**Date**: 2026-03-18  
**Status**: Accepted

### Context

In a microservices architecture, which service should own the permission logic? The user service is often treated as a
“permission center”, but that can lead to high coupling between services.

### Options Considered

- **Centralized Permissions**: All permission data (roles, resource permissions) is stored in the user service; other
  services check permissions by calling the user service.
- **Decentralized Permissions**: The user service only provides identity and basic attributes (e.g., user type, tenant
  membership). Each business service manages resource‑level permissions on its own.

### Decision

Adopt **Decentralized Permissions**. The user service may optionally provide tenant‑level roles (e.g., tenant
administrator), but fine‑grained permissions are managed by each business service.

### Rationale

- Follows the Single Responsibility Principle: the user service focuses on identity and organizational structure, not
  business logic.
- Avoids single points of failure and performance bottlenecks (every request would otherwise need to go through the user
  service).
- Permissions are tightly coupled with business logic, making business services more cohesive.
- Tenant‑level roles can still be stored in the user service because they are cross‑service “global” roles and do not
  introduce excessive coupling.

---

## ADR-002: Permission Data Model for Business Services

**Date**: 2026-03-19  
**Status**: Accepted

### Context

Each business service implementing the decentralized permission model (ADR-001) needs a consistent, efficient way to
store and query permissions. The model must support the primary access pattern: checking whether a user has a specific
action on a resource type.

### Decision

We define a standard permission table schema to be used by all business services:

- **Table name**: `{service_name}_permissions` (e.g., `document_permissions`, `comment_permissions`) – each service owns
  its own permission table.
- **Core Columns**:
    - `user_id` (`bigint`, part of composite primary key) – identifier of the user.
    - `resource` (`enum`) – the resource type, defined as an enum in the service (e.g., `document`, `comment`).
    - `action` (`enum`) – the action, defined as an enum per service (e.g., `read`, `write`, `delete`).
- **Primary key**: `(user_id, resource, action)` – ensures at most one active (non‑deleted) permission per
  user/resource/action combination.
- **No `updated_at` or `version`**: permission rows are immutable once inserted; the only allowed change is deletion (
  soft delete).

### Caching Strategy

To reduce database load, each business service may cache permission checks in Redis. The cache key follows the pattern
`permission:{user_id}:{resource}:{action}`.

### Consequences

- All business services adopt a uniform permission data model, simplifying development and cross‑service comprehension.
- Enums for resource and action provide type safety and efficient storage (PostgreSQL stores enums as 4 bytes).
- The composite primary key prevents duplicate active permissions without extra application logic.
- Omitting `updated_at` and `version` aligns with the immutability of permission rows.
- Caching improves performance; services must handle cache invalidation correctly.

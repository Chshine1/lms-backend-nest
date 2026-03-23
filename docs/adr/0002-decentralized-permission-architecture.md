# ADR 0002: Decentralized Permission Architecture

## Status

Accepted

## Context

In a microservices architecture, which service should own the permission logic? The user service is often treated as a
"permission center", but that can lead to high coupling between services. Each business service needs a consistent,
efficient way to store and query permissions.

## Decision

We adopt a **Decentralized Permission Model** with **Unified Data Schema**:

1. **Decentralized Storage**: The user service provides identity and basic attributes (e.g., user type, tenant
   membership). Each business service manages resource-level permissions on its own. The user service may optionally
   provide tenant-level roles (e.g., tenant administrator), but fine-grained permissions are managed by each business
   service.

2. **Unified Permission Schema**: All business services adopt a standard permission data model:
    - Each service owns its own permission table named `{service_name}_permissions`.
    - Core columns: `user_id`, `resource` (enum), `action` (enum).
    - Primary key: `(user_id, resource, action)` — ensures at most one active (non-deleted) permission per
      user/resource/action combination.
    - Permission rows are immutable once inserted; the only allowed change is deletion (soft delete).

## Consequences

### Positive

- **Single Responsibility**: The user service focuses on identity and organizational structure, not business logic.
- **No Single Points of Failure**: Avoids performance bottlenecks that would occur if every request went through the
  user
  service.
- **Business Cohesion**: Permissions are tightly coupled with business logic, making business services more cohesive.
- **Uniformity**: All business services adopt a consistent permission data model, simplifying development and
  cross-service comprehension.
- **Type Safety**: Enums for resource and action provide type safety and efficient storage.
- **Tenant Roles**: Tenant-level roles can still be stored in the user service because they are cross-service "global"
  roles and do not introduce excessive coupling.

### Negative

- Each business service is responsible for implementing its own permission management logic.
- Services must handle caching and cache invalidation independently.

## Compliance

- Each business service must implement permission management following the schema defined in
  `docs/architecture/permission.md`.
- Code reviews should verify that permission tables follow the `{service_name}_permissions` naming convention.
- The permission implementation documentation must be kept up-to-date with any schema changes.

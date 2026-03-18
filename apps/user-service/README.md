# User Service Design

This document outlines the design of the User Service, a microservice responsible for managing tenants and users in a
B2B education platform. The service is cohesive, keeping tenant and user concepts within the same bounded context.

## Core Entities

### Tenant

Represents an organization (school, training center) that registers and uses the platform.

- `id` (PK)
- `name`
- `code` (unique identifier for the tenant)
- `status` (active, suspended)
- `created_at`, `updated_at`

### User

Represents an individual who accesses the system within a tenant.

- `id` (PK)
- `tenant_id` (FK to Tenant) — each user belongs to exactly one tenant.
- `username` (unique within tenant)
- `email`
- `phone`
- `password_hash`
- `status` (active, inactive, locked)
- `identity_type` — discriminator indicating which specific identity table holds extended data (e.g., `student`,
  `teacher`).
- `created_at`, `updated_at`

## Extended Entities

### Campus

A physical or virtual location under a tenant. Optional but commonly needed.

- `id` (PK)
- `tenant_id` (FK to Tenant)
- `name`
- `location` (address, coordinates)
- `timezone` or operational hours (optional)
- `created_at`, `updated_at`

## Identity and User Types

Users have a **type** (e.g., `student`, `teacher`, `parent`, `admin`) that defines their function in the system and
determines which additional attributes they require. Each type is a distinct sub‑entity with its own table, following
the **class‑table inheritance** pattern.

### Storage Design

- **Base table**: `users` contains all common fields (including `identity_type`).
- **Type‑specific tables**: One table per identity type, e.g.:
    - `students`: `user_id` (FK), `student_id`, `grade_level`, `enrollment_date`
    - `teachers`: `user_id` (FK), `employee_id`, `qualifications`, `hire_date`
    - `parents`: `user_id` (FK), `relation_to_student`, `occupation`
    - `admins`: `user_id` (FK), `department`, `job_title`

Each type table has a 1:1 relationship with `users` via `user_id`. This ensures data integrity and avoids nullable
columns in the base table.

#### Multiple Identities per User

In the current scope, a user is assumed to have a single primary identity. If a user needs to act under multiple roles (
e.g., a teacher who is also a parent), a many‑to‑many link table (`user_identities`) can be introduced later without
breaking the core design.

## Permissions and Authorization

Permissions are decentralized: each service is responsible for its own authorization logic. The User Service only:

- Authenticates users (issues JWT containing user ID, tenant ID, and identity type).
- Provides basic user attributes and tenant context to other services.
- Optionally manages **tenant‑wide roles** (e.g., `tenant_admin`, `campus_manager`) that grant coarse‑grained
  permissions across services.

### Roles (Optional)

If tenant‑wide roles are needed, a simple `user_roles` table can be added:

- `user_id`
- `role` (e.g., `tenant_admin`, `campus_manager`)
- `campus_id` (if the role is campus‑scoped)

Fine‑grained permissions (e.g., “can edit course #123”) are stored and enforced within the respective domain services (
Course Service, Grade Service, etc.). This keeps the User Service focused on identity and organizational structure.

## API Design (Outline)

The service exposes RESTful endpoints for:

- Tenant management (CRUD)
- User management (CRUD, authentication)
- Campus management (CRUD)
- User‑campus assignments
- Retrieving user identity details (including type‑specific data)

All operations are tenant‑scoped, and authentication is required.
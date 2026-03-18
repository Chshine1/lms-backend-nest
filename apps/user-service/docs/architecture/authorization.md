# Decentralized Authorization Design

## Overview

Following ADR‑002, the User Service does **not** act as a central permission engine. Instead, it provides the
foundational identity and context, while each business service implements its own resource‑level authorization. This
document details how this is achieved.

## What the User Service Provides

### 1. Authentication & JWT

Upon successful login, the User Service issues a JWT containing:

- `sub`: user ID
- `tenant_id`: tenant ID
- `identity_type`: e.g., `student`, `teacher`, `admin`
- `roles`: optional list of tenant‑wide roles (e.g., `tenant_admin`, `campus_manager`)
- `campus_id`: if the user is associated with a specific campus (optional)
- `iat`, `exp`: standard timestamps

The JWT is signed with a service‑shared secret (or asymmetric key) so that other services can verify it without calling
the User Service.

### 2. Tenant‑Wide Roles

The User Service optionally manages a simple `user_roles` table (see schema). These roles are **coarse‑grained** and
span multiple business domains. Examples:

- `tenant_admin`: full access within the tenant.
- `campus_manager`: manage resources for a specific campus (identified by `campus_id` in the role).

These roles are included in the JWT. Business services can use them for broad access decisions (e.g., a `tenant_admin`
may bypass resource‑level checks).

### 3. User Profile Endpoints

Other services can query the User Service (via REST) to obtain additional user details when needed, e.g.,
`GET /users/{id}`. This is typically done during request processing to enrich context or for audit logging. The User
Service ensures that only authorized callers (other microservices) can access these endpoints (using service‑to‑service
authentication, e.g., mTLS or API keys).

## What Business Services Do

Each business service (Course Service, Grade Service, etc.) is responsible for its own authorization logic. They
typically:

- Verify the JWT on each incoming request (using a shared library).
- Extract user context (user ID, tenant ID, roles).
- Enforce access control based on:
    - **Ownership**: e.g., a teacher can only edit courses they teach.
    - **Resource‑level permissions**: stored in the service’s own database (e.g., `course_teachers` table).
    - **Tenant isolation**: all data is naturally scoped by `tenant_id` (the JWT ensures the request belongs to a
      tenant).
    - **Coarse roles**: if the JWT contains `tenant_admin`, the service may allow any operation.

### Example: Course Service Permission Check

A teacher requests to update a course. The Course Service:

1. Extracts `user_id` and `tenant_id` from JWT.
2. Checks if the user has `tenant_admin` role (skip further checks).
3. Otherwise, queries its `course_teachers` table to see if the user is assigned to this course.
4. If yes, allow; else, deny.

### Resource‑Level Permissions Storage

Each service defines its own tables for permissions:

- `course_teachers`: (course_id, teacher_id)
- `class_students`: (class_id, student_id)
- `assignment_submissions`: (assignment_id, student_id)

This keeps permission data close to the resources they protect.

## Handling Cross‑Service Authorization

When a business service needs to know if a user has a certain relationship to another service’s resource, it either:

- Calls the owning service’s API to check (e.g., “Is user X enrolled in course Y?”), or
- Relies on events to replicate necessary data locally (if performance is critical). For example, the Grade Service
  might subscribe to enrollment events to build a local table of `student_courses`.

The User Service does **not** get involved in these decisions.

## Role Management UI

The User Service provides admin endpoints for managing tenant‑wide roles (assign/revoke). These are used by the tenant
admin UI. Fine‑grained permissions are managed within each business service’s admin UI.

## Audit Logging

All services log authorization decisions (allow/deny) with user ID, resource, and action. The User Service logs role
assignments and authentication events.

## Summary

- User Service: JWT + coarse roles + user profile.
- Business services: resource‑level permissions + tenant isolation.
- No central permission service → loose coupling, better scalability.

# User Service Internal Modules

## Internal Layering

The User Service follows a typical hexagonal (ports & adapters) architecture:

```
┌─────────────────┐
│    Controllers  │  REST endpoints (primary adapters)
└────────┬────────┘
         │
┌────────▼────────┐
│    Application  │  Use‑case orchestration (services)
└────────┬────────┘
         │
┌────────▼────────┐
│     Domain      │  Core business logic, entities, value objects
└────────┬────────┘
         │
┌────────▼────────┐
│  Repositories   │  Data access interfaces
└────────┬────────┘
         │
┌────────▼────────┐
│    Database     │  PostgreSQL (secondary adapter)
└─────────────────┘
```

### Modules

- **Auth Module**: Handles login, token issuance, password hashing.
- **User Management**: CRUD for users, tenants, campuses.
- **Role Management**: Assign/revoke tenant‑wide roles.
- **Profile Module**: Retrieves user details (including type‑specific data).

Each module has its own service class and repository.

## Interaction with Other Services

### Synchronous REST

Other services call User Service endpoints to:

- Get user profile (`GET /users/{id}`)
- List users by tenant, role, etc. (with pagination)
- Verify existence of a user (e.g., before enrolling in a course)

These calls are authenticated via service‑to‑service tokens.

### Asynchronous Events (Kafka / RabbitMQ)

The User Service emits events when important changes occur:

- `user.created`
- `user.updated`
- `user.deleted`
- `user.role.assigned`
- `user.role.revoked`

Other services subscribe to these events to keep their local caches or permission tables consistent.

## Deployment

- The User Service is a separate container/process.
- It exposes a REST API on a specific port.
- Database is separate (could be a shared database cluster with other services, but each service has its own schema).

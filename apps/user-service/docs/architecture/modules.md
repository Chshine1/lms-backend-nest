# User Service Internal Modules & Interaction

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
- **Communication Logs**: Records staff‑student interactions.
- **Task & Report Module**: Manages learning tasks and reports (optional; could be split if too heavy).

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

Other services subscribe to these events to keep their local caches or permission tables consistent. For example, the
Course Service may maintain a denormalized list of teachers to speed up authorization checks.

### External Integrations

- **File Storage**: For uploading evidence (exam screenshots, communication attachments), the User Service delegates to
  a dedicated file service (e.g., S3 with presigned URLs). It stores only the URL.
- **Notification Service**: Sends emails/push notifications via an external service. The User Service triggers
  notifications on events like user creation, role change, etc.

## Deployment

- The User Service is a separate container/process.
- It exposes a REST API on a specific port.
- Database is separate (could be a shared database cluster with other services, but each service has its own schema).

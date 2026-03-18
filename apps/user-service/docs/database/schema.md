# Database Schema Design

This document defines the database tables for the User Service, following the **class‑table inheritance** pattern for
user identities. The schema is designed to support the core entities (Tenant, User, Campus) and user identity types.

## Naming Conventions

- Table names: plural, snake_case (e.g., `tenants`, `users`).
- Primary key: `id` (bigint, auto‑increment) for all tables.
- Foreign keys: `<table>_id` (e.g., `tenant_id`, `user_id`).
- Timestamps: `created_at`, `updated_at` (timestamptz) on all tables.

## Core Tables

### tenants

| Column     | Type         | Description                                |
|------------|--------------|--------------------------------------------|
| id         | bigint       | PK                                         |
| name       | varchar(255) | Tenant display name                        |
| code       | varchar(50)  | Unique tenant identifier (e.g., subdomain) |
| status     | varchar(20)  | active, suspended                          |
| created_at | timestamptz  |                                            |
| updated_at | timestamptz  |                                            |

### users

| Column        | Type         | Description                                            |
|---------------|--------------|--------------------------------------------------------|
| id            | bigint       | PK                                                     |
| tenant_id     | bigint       | FK → tenants.id                                        |
| username      | varchar(100) | Unique within tenant (composite unique with tenant_id) |
| email         | varchar(255) |                                                        |
| phone         | varchar(50)  |                                                        |
| password_hash | varchar(255) | bcrypt hash                                            |
| status        | varchar(20)  | active, inactive, locked                               |
| identity_type | varchar(50)  | Discriminator: student, teacher, parent, admin         |
| created_at    | timestamptz  |                                                        |
| updated_at    | timestamptz  |                                                        |

Indexes: unique (tenant_id, username), (email), (phone) optionally.

### campuses

| Column     | Type         | Description              |
|------------|--------------|--------------------------|
| id         | bigint       | PK                       |
| tenant_id  | bigint       | FK → tenants.id          |
| name       | varchar(255) | Campus name              |
| location   | text         | Address / coordinates    |
| timezone   | varchar(50)  | IANA timezone (optional) |
| created_at | timestamptz  |                          |
| updated_at | timestamptz  |                          |

## Identity Extension Tables (Class‑Table Inheritance)

Each user type has a dedicated table with a 1:1 relationship to `users`. The `user_id` is both PK and FK.

### students

| Column          | Type        | Description                    |
|-----------------|-------------|--------------------------------|
| user_id         | bigint      | PK, FK → users.id              |
| student_id      | varchar(50) | External student ID (optional) |
| grade_level     | varchar(50) | e.g., Grade 9, A-Level         |
| enrollment_date | date        |                                |

### teachers

| Column         | Type        | Description       |
|----------------|-------------|-------------------|
| user_id        | bigint      | PK, FK → users.id |
| employee_id    | varchar(50) |                   |
| qualifications | text        |                   |
| hire_date      | date        |                   |

### parents

| Column              | Type         | Description              |
|---------------------|--------------|--------------------------|
| user_id             | bigint       | PK, FK → users.id        |
| relation_to_student | varchar(50)  | father, mother, guardian |
| occupation          | varchar(100) |                          |

### admins

| Column     | Type         | Description       |
|------------|--------------|-------------------|
| user_id    | bigint       | PK, FK → users.id |
| department | varchar(100) |                   |
| job_title  | varchar(100) |                   |

If a user needs multiple identities in the future, a bridge table `user_identities` can be introduced:

- `user_id` (FK to users)
- `identity_type` (student, teacher, …)
- `identity_id` (FK to the corresponding type table)

## Remarks

- The schema is designed to be extensible: new user types only require a new extension table.
- Tenant‑wide roles are managed separately in authorization modules.
- User Service focuses on core user identity management and authentication.

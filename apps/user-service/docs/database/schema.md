# Database Schema Design

This document defines the database tables for the User Service, following the **class‑table inheritance** pattern for
user identities. The schema is designed to support the core entities (Tenant, User, Campus) and to accommodate the
requirements from the use cases (e.g., roles, communication logs, learning tasks, reports).

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

| Column                           | Type        | Description                    |
|----------------------------------|-------------|--------------------------------|
| user_id                          | bigint      | PK, FK → users.id              |
| student_id                       | varchar(50) | External student ID (optional) |
| grade_level                      | varchar(50) | e.g., Grade 9, A-Level         |
| enrollment_date                  | date        |                                |
| ... (other type‑specific fields) |             |                                |

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

This keeps the core design extensible.

## Supporting Tables for Use Cases

### user_roles (tenant‑wide roles)

| Column     | Type        | Description                        |
|------------|-------------|------------------------------------|
| id         | bigint      | PK                                 |
| user_id    | bigint      | FK → users.id                      |
| role       | varchar(50) | e.g., tenant_admin, campus_manager |
| campus_id  | bigint      | FK → campuses.id (nullable, scope) |
| created_at | timestamptz |                                    |

### communication_logs

| Column             | Type        | Description                          |
|--------------------|-------------|--------------------------------------|
| id                 | bigint      | PK                                   |
| user_id            | bigint      | FK → users.id (the student)          |
| actor_id           | bigint      | FK → users.id (the staff who logged) |
| communication_type | varchar(50) | phone, wechat, face‑to‑face          |
| target             | varchar(50) | student, parent                      |
| summary            | text        |                                      |
| follow_up          | text        |                                      |
| attachments        | jsonb       | Array of file URLs (optional)        |
| created_at         | timestamptz |                                      |

### learning_tasks

| Column       | Type         | Description                     |
|--------------|--------------|---------------------------------|
| id           | bigint       | PK                              |
| user_id      | bigint       | FK → users.id (student)         |
| title        | varchar(255) |                                 |
| description  | text         |                                 |
| due_date     | timestamptz  |                                 |
| status       | varchar(20)  | pending, completed, overdue     |
| completed_at | timestamptz  |                                 |
| created_by   | bigint       | FK → users.id (teacher/advisor) |
| created_at   | timestamptz  |                                 |
| updated_at   | timestamptz  |                                 |

### reports

| Column       | Type        | Description                                            |
|--------------|-------------|--------------------------------------------------------|
| id           | bigint      | PK                                                     |
| user_id      | bigint      | FK → users.id (student)                                |
| type         | varchar(50) | mock, midterm, final, post‑exam                        |
| content      | jsonb       | Structured report data (scores, analysis, suggestions) |
| status       | varchar(20) | draft, pending_review, published                       |
| reviewed_by  | bigint      | FK → users.id (teacher/advisor)                        |
| published_at | timestamptz |                                                        |
| created_at   | timestamptz |                                                        |
| updated_at   | timestamptz |                                                        |

### exam_records

| Column          | Type         | Description                 |
|-----------------|--------------|-----------------------------|
| id              | bigint       | PK                          |
| user_id         | bigint       | FK → users.id               |
| exam_type       | varchar(50)  | IELTS, TOEFL, internal mock |
| exam_date       | date         |                             |
| total_score     | numeric(5,2) |                             |
| listening_score | numeric(5,2) |                             |
| reading_score   | numeric(5,2) |                             |
| writing_score   | numeric(5,2) |                             |
| speaking_score  | numeric(5,2) |                             |
| evidence_url    | text         | Link to uploaded screenshot |
| status          | varchar(20)  | pending, confirmed          |
| created_at      | timestamptz  |                             |
| updated_at      | timestamptz  |                             |

### course_enrollments

| Column      | Type        | Description                          |
|-------------|-------------|--------------------------------------|
| id          | bigint      | PK                                   |
| user_id     | bigint      | FK → users.id (student)              |
| course_id   | bigint      | References Course Service (external) |
| role        | varchar(20) | student, teacher                     |
| status      | varchar(20) | enrolled, dropped, completed         |
| enrolled_at | timestamptz |                                      |
| dropped_at  | timestamptz |                                      |
| created_at  | timestamptz |                                      |

Note: `course_id` is an external identifier; the User Service does not own course data.

### notes (for onboarding, feedback, etc.)

| Column     | Type        | Description                   |
|------------|-------------|-------------------------------|
| id         | bigint      | PK                            |
| user_id    | bigint      | FK → users.id (student)       |
| author_id  | bigint      | FK → users.id (staff)         |
| content    | text        |                               |
| note_type  | varchar(50) | onboarding, feedback, general |
| created_at | timestamptz |                               |

## Additional Indexes

- Foreign keys: all `*_id` columns indexed.
- `communication_logs` on `user_id`, `actor_id`, `created_at`.
- `learning_tasks` on `user_id`, `due_date`, `status`.
- `reports` on `user_id`, `type`, `status`.
- `exam_records` on `user_id`, `exam_date`.

## Remarks

- The schema is designed to be extensible: new user types only require a new extension table.
- Tenant‑wide roles are optional; fine‑grained permissions are managed by business services.
- Tables like `communication_logs`, `learning_tasks`, `reports` are owned by the User Service because they are closely
  tied to user identity and are needed across multiple business domains. This follows the principle of keeping related
  data together.
- External references (e.g., `course_id`) are stored as plain IDs; the User Service does not maintain foreign key
  constraints to external services.

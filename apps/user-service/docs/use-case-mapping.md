# User Service Use Case Coverage

This document maps user-related use cases from the requirements to the User Service design.

## Covered Use Cases

| Use Case ID            | Name               | Covered By                                          | Notes                                                              |
|------------------------|--------------------|-----------------------------------------------------|--------------------------------------------------------------------|
| UC‑INFO‑01, UC‑INFO‑02 | Query contact info | User Service (users table + identity tables) + RBAC | Access control via JWT roles; user contact information management. |
| UC‑ADMIN‑01            | RBAC               | `user_roles` + JWT.                                 | Tenant-wide role management.                                       |
| UC‑ADMIN‑04            | Org & campus       | `campuses` table, `user_roles.campus_id`.           | Campus and organization structure management.                      |

## User Service Scope

The User Service focuses on core user identity management, including:

- User authentication and authorization
- User profile and contact information management
- Tenant and campus structure management
- Role-based access control for tenant-wide permissions

## Related Use Cases Handled by Other Services

The following use cases are handled by other microservices in the system:

- **UC‑CLASS‑01**: View class roster & student archive (Course Service)
- **UC‑FEED‑01**: Classroom feedback (Course Service)
- **UC‑MAT‑01**: Upload/distribute note (File Storage Service)
- **UC‑VOD‑01**: Recorded course unlocking (Video Service)
- **UC‑POST‑01**: Grading cards (Billing Service)
- **UC‑POST‑02**: Post‑course access (Course Service)
- **UC‑OC‑01**: Onboarding flow (Onboarding Service)
- **UC‑PLAN‑01**: Student type & learning plan (Learning Service)
- **UC‑LEARN‑01**: Learning tasks (Learning Service)
- **UC‑LEARN‑02**: Wrong‑word/vocab notebook (Learning Service)
- **UC‑LEARN‑03**: Teacher preview of student prep (Learning Service)
- **UC‑MOCK‑01**: Mock exam plan & report (Exam Service)
- **UC‑REPORT‑02**: Periodic learning report (Reporting Service)
- **UC‑EXAM‑01**: Real exam entry & evidence (Exam Service)
- **UC‑EXAM‑02**: Unmet‑goal diagnosis & plan (AI Service)
- **UC‑FOLLOW‑01**: Advisor communication (Communication Service)
- **UC‑PROFILE‑01**: Student lifecycle archive (Profile Service)
- **UC‑COMM‑01**: Home‑school communication (Communication Service)
- **UC‑ADMIN‑02**: System config (Configuration Service)
- **UC‑ADMIN‑03**: Audit logs (Audit Service)
- **UC‑ADMIN‑05**: Reports & export (Reporting Service)

## Integration Points

The User Service provides user identity and authentication services to other microservices through:

- REST API endpoints for user profile queries
- JWT tokens for authentication and authorization
- Event publishing for user lifecycle changes
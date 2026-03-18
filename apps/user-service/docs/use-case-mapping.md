# Use Case Coverage & Gaps

This document maps each use case from the requirements to the existing design and identifies any gaps.

## Covered Use Cases

| Use Case ID            | Name                                | Covered By                                                                                               | Notes                                                                           |
|------------------------|-------------------------------------|----------------------------------------------------------------------------------------------------------|---------------------------------------------------------------------------------|
| UC‑INFO‑01, UC‑INFO‑02 | Query contact info                  | User Service (users table + identity tables) + RBAC                                                      | Access control via JWT roles; logging via `communication_logs`.                 |
| UC‑CLASS‑01            | View class roster & student archive | User Service provides student profiles; Course Service provides class enrollment.                        | Combined data requires orchestration (API Gateway or BFF).                      |
| UC‑FEED‑01             | Classroom feedback                  | `notes` table with type `feedback`. Attachments stored externally.                                       | Feedback is linked to user and course (course_id stored).                       |
| UC‑MAT‑01              | Upload/distribute note              | File storage service; URLs stored in a `materials` table (to be added) – see gaps.                       | Not yet designed; needs a `course_materials` table.                             |
| UC‑VOD‑01              | Recorded course unlocking           | Requires integration with video platform and progress tracking.                                          | Partially covered by `learning_tasks`; explicit unlock rules need design.       |
| UC‑POST‑01             | Grading cards                       | `learning_tasks` with type `grading`; payment handled by billing service.                                | Gaps: billing integration, card balance.                                        |
| UC‑POST‑02             | Post‑course access                  | User Service manages account status and expiration.                                                      | Status field can be extended to include `access_until`.                         |
| UC‑OC‑01               | Onboarding flow                     | `notes` (onboarding), `communication_logs`, `exam_records` (for placement).                              | Workflow state machine not in scope; handled by a dedicated onboarding service. |
| UC‑PLAN‑01             | Student type & learning plan        | `users.identity_type` + `learning_tasks`.                                                                | VIP vs regular logic could be implemented in a separate planning service.       |
| UC‑LEARN‑01            | Learning tasks                      | `learning_tasks` table.                                                                                  |                                                                                 |
| UC‑LEARN‑02            | Wrong‑word/vocab notebook           | Could be built on `learning_tasks` + a `vocabulary` table (new).                                         | Gap: dedicated vocab extraction logic.                                          |
| UC‑LEARN‑03            | Teacher preview of student prep     | Aggregates from `learning_tasks`, `exam_records`, `notes`.                                               | Needs a dedicated view/API.                                                     |
| UC‑MOCK‑01             | Mock exam plan & report             | `exam_records` + `reports`.                                                                              |                                                                                 |
| UC‑REPORT‑02           | Periodic learning report            | `reports` table.                                                                                         |                                                                                 |
| UC‑EXAM‑01             | Real exam entry & evidence          | `exam_records`.                                                                                          |                                                                                 |
| UC‑EXAM‑02             | Unmet‑goal diagnosis & plan         | `reports` with type `post‑exam`. AI part external.                                                       | Gap: AI integration.                                                            |
| UC‑FOLLOW‑01           | Advisor communication               | `communication_logs` + `user_roles` (for supervisor view).                                               |                                                                                 |
| UC‑PROFILE‑01          | Student lifecycle archive           | All core tables + supporting tables.                                                                     |                                                                                 |
| UC‑COMM‑01             | Home‑school communication           | `communication_logs`.                                                                                    |                                                                                 |
| UC‑ADMIN‑01            | RBAC                                | `user_roles` + JWT.                                                                                      |                                                                                 |
| UC‑ADMIN‑02            | System config                       | Not in User Service; belongs to a config service.                                                        | Gap: no central config service yet.                                             |
| UC‑ADMIN‑03            | Audit logs                          | Implicit via `created_at` and `updated_at` on all tables; separate audit table needed for sensitive ops. | Gap: dedicated audit log table.                                                 |
| UC‑ADMIN‑04            | Org & campus                        | `campuses` table, `user_roles.campus_id`.                                                                |                                                                                 |
| UC‑ADMIN‑05            | Reports & export                    | `reports` table + BI export.                                                                             |                                                                                 |

## Gaps & Future Extensions

The following aspects are **not yet designed** and need to be addressed in future iterations:

1. **File Storage Service** – A dedicated service for storing and serving files (course materials, evidence images) with
   access control and CDN. The User Service should only store URLs.

2. **AI Integration** – Use cases like UC‑EXAM‑02 (AI diagnosis), UC‑LEARN‑02 (vocabulary extraction) require
   integration with AI/ML services. These would be separate services that consume data from the User Service and push
   back results (e.g., as reports or tasks).

3. **Billing & Payments** – For paid services (grading cards, extended access), the User Service needs to interact with
   a Billing Service. The current design only records usage; payment logic is external.

4. **Video Platform Integration** – For UC‑VOD‑01 (recorded courses), a dedicated video service with DRM is needed. The
   User Service would manage access tokens and sync enrollment data.

5. **Workflow Engines** – Complex flows like onboarding (UC‑OC‑01) may benefit from a workflow engine (e.g., Camunda) to
   manage state transitions. The User Service provides data but not orchestration.

6. **Centralized Configuration** – UC‑ADMIN‑02 (system config) requires a configuration service; currently not defined.

7. **Dedicated Audit Table** – For compliance, an `audit_logs` table with before/after snapshots should be added to the
   User Service.

8. **Vocabulary Notebook** – A `vocabulary` table to support UC‑LEARN‑02, with fields like `user_id`, `word`,
   `definition`, `context`, `mastery_level`.

9. **Course Materials Table** – To support UC‑MAT‑01, a `course_materials` table with `course_id`, `title`, `file_url`,
   `uploaded_by`, `visibility` (student/parent).

10. **Grading Cards Balance** – For UC‑POST‑01, a `grading_balance` table per user with `type` (writing/oral),
    `remaining`, `expiry_date`.

These gaps do not break the current design; they represent areas where the User Service acts as a source of truth but
delegates specialized functionality to other services. The existing tables already support many use cases, and the
missing ones can be added as separate microservices or as extensions within the User Service if they remain cohesive.
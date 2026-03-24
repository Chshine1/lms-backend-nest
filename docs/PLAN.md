# Requirements Document: MVP Services

## 1. Overview

This document defines the requirements for three new microservices to complete the Learning Management System (LMS) MVP. These services handle course scheduling, student enrollment, and the assignment submission and review workflow.

The context is an existing **User Service** (with `User` and `Tenant` aggregates) and a **Course Service** (with `Course`, `CourseSection`, and `Assignment` aggregates). The new services will interact with these existing ones, primarily through their public APIs or by referencing their aggregate IDs.

The MVP goal is to provide the minimum functionality for a single tenant with three user roles: Student, Teacher, and Administrator.

---

## 2. Service 1: Scheduling Service

### 2.1. Purpose
The Scheduling Service manages the logistical details of when and where a course meets. It is separate from the Course Service to maintain a clean separation between the course's academic content (syllabus, sections, assignments) and its operational schedule.

### 2.2. Core Entity

#### `CourseSchedule`
This is the root aggregate for this service. A `Course` can have multiple `CourseSchedule` records (e.g., for a course that meets on Mondays and Wednesdays).

| Field | Type | Description |
| :--- | :--- | :--- |
| `id` | number | Unique identifier. |
| `courseId` | number | Reference to the `Course` aggregate root in the Course Service. |
| `dayOfWeek` | enum | The day of the week. Values: `MONDAY`, `TUESDAY`, `WEDNESDAY`, `THURSDAY`, `FRIDAY`, `SATURDAY`, `SUNDAY`. |
| `startTime` | time | The start time of the session (e.g., "09:00"). |
| `endTime` | time | The end time of the session (e.g., "10:30"). |
| `location` | string | The physical or virtual location (e.g., "Room 101", "Zoom Link"). |

**Business Invariants:**
- A `courseId` must be a valid course that exists in the Course Service.
- A `CourseSchedule` cannot have an `endTime` that is before its `startTime`.
- For a given `courseId`, schedules should not overlap in time on the same day of the week.

### 2.3. API Operations (MVP)

| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `/api/schedules` | `POST` | Create a new schedule entry for a course. |
| `/api/schedules/course/{courseId}` | `GET` | Retrieve all schedule entries for a specific course. |
| `/api/schedules/{id}` | `PUT` | Update a specific schedule entry. |
| `/api/schedules/{id}` | `DELETE` | Delete a specific schedule entry. |

---

## 3. Service 2: Enrollment Service

### 3.1. Purpose
The Enrollment Service manages the relationship between a `User` (Student) and a `Course`. Its primary function in the MVP is to act as a simple join table, capturing which students are enrolled in which courses.

### 3.2. Core Entity

#### `Enrollment`
This is the root aggregate for this service. It represents the act of a student joining a course.

| Field | Type | Description |
| :--- | :--- | :--- |
| `id` | number | Unique identifier. |
| `studentId` | number | Reference to a `User` aggregate root in the User Service. This user must have the `student` role. |
| `courseId` | number | Reference to the `Course` aggregate root in the Course Service. |
| `enrolledAt` | datetime | Timestamp of when the enrollment was created. |

**Business Invariants:**
- A `studentId` must be a valid user with the `student` role.
- A `courseId` must be a valid course that exists in the Course Service.
- A student cannot be enrolled in the same course more than once.

### 3.3. API Operations (MVP)

| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `/api/enrollments` | `POST` | Enroll a student in a course. |
| `/api/enrollments/course/{courseId}` | `GET` | Retrieve all enrollments for a specific course (list of student IDs). |
| `/api/enrollments/student/{studentId}` | `GET` | Retrieve all courses a specific student is enrolled in (list of course IDs). |
| `/api/enrollments/{id}` | `DELETE` | Unenroll a student from a course. |

---

## 4. Service 3: Assignment Service

### 4.1. Purpose
This service manages the lifecycle of student work. It handles the submission of assignments, the storage of submission data, and the teacher's review process, which includes grading and providing feedback.

### 4.2. Core Aggregates

#### `Submission`
This is the main root aggregate. It represents a student's attempt at a specific assignment. The consistency boundary ensures that a student has only one active submission per assignment and that the submission state changes correctly.

| Field | Type | Description |
| :--- | :--- | :--- |
| `id` | number | Unique identifier. |
| `enrollmentId` | number | Reference to the `Enrollment` aggregate root in the Enrollment Service. |
| `assignmentId` | number | Reference to the `Assignment` aggregate root in the Course Service. |
| `submissionText` | string | Textual content of the submission (if applicable). |
| `attachments` | list of `FileReference` | References to files stored in a file service (e.g., PDF, image, code file). |
| `submittedAt` | datetime | Timestamp of the submission. |
| `status` | enum | The state of the submission. Values: `DRAFT`, `SUBMITTED`, `GRADED`. |

#### `Review`
This is a child entity of the `Submission` aggregate. It represents the teacher's evaluation.

| Field | Type | Description |
| :--- | :--- | :--- |
| `id` | number | Unique identifier. |
| `teacherId` | number | Reference to a `User` aggregate root in the User Service. This user must have the `teacher` role. |
| `score` | number | The numerical grade given to the submission. |
| `feedback` | string | Textual feedback from the teacher. |
| `reviewedAt` | datetime | Timestamp of the review. |

**Value Objects:**
- **`FileReference`**: A lightweight object containing `fileId` (string) and `fileName` (string) to reference a file in the external file service.

### 4.3. Business Invariants

1.  **One Active Submission**: A student (via their enrollment) can have only one `Submission` in the `DRAFT` or `SUBMITTED` state for a given `assignmentId`. A new submission can only be created if no prior active submission exists.
2.  **Submission-Enrollment Validity**: The `enrollmentId` must correspond to a valid enrollment where the student is enrolled in the course that contains the `assignmentId`.
3.  **Reviewer Permissions**: The `teacherId` in a `Review` must be a teacher assigned to the `Course` that contains the `assignmentId`. (This may require a check against the Course Service).
4.  **Immutable After Grading**: Once a `Submission` is `GRADED`, its core fields (`submissionText`, `attachments`) cannot be modified.
5.  **Single Review**: A `Submission` can have at most one `Review`.

### 4.4. Domain Events

| Event Name | Trigger | Data Payload |
| :--- | :--- | :--- |
| `submission.created` | A new submission is created (as a draft). | `{ submissionId, enrollmentId, assignmentId }` |
| `submission.submitted` | A student submits their draft for grading. | `{ submissionId, enrollmentId, assignmentId, submittedAt }` |
| `submission.reviewed` | A teacher adds a review to a submission. | `{ submissionId, teacherId, score, reviewedAt }` |

### 4.5. API Operations (MVP)

#### Student Operations
| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `/api/submissions` | `POST` | Create a new submission (initially in `DRAFT` state). |
| `/api/submissions/{id}` | `PUT` | Update a submission (only allowed when `status` is `DRAFT`). |
| `/api/submissions/{id}/submit` | `POST` | Change submission status from `DRAFT` to `SUBMITTED`. After this, it can no longer be edited. |
| `/api/submissions/assignment/{assignmentId}/enrollment/{enrollmentId}` | `GET` | Retrieve a student's submission for a specific assignment. |

#### Teacher Operations
| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `/api/submissions/assignment/{assignmentId}` | `GET` | Get all submissions for a specific assignment (across all enrolled students). This is the teacher's "gradebook" view. |
| `/api/submissions/{submissionId}/review` | `POST` | Create a review for a specific submission. This will change the submission's `status` to `GRADED`. |
| `/api/submissions/{submissionId}/review` | `PUT` | Update an existing review. |
| `/api/submissions/{submissionId}/review` | `GET` | Get the review for a specific submission. |

### 4.6. Relationships with Other Services

- **Course Service:** This service uses `assignmentId` as a foreign identifier. When a teacher requests all submissions for an assignment, it may need to fetch assignment details (title) for display, but this is a query-time concern, not a transactional one.
- **Enrollment Service:** This service is critical. When a teacher requests submissions for an assignment, the service must first get the list of `enrollmentId`s for that `courseId` from the Enrollment Service to ensure there is a submission record for every enrolled student. The `enrollmentId` is the key link.
- **User Service:** `studentId` and `teacherId` are used, but only as identifiers. The display names for these users would be fetched by the frontend or a BFF (Backend for Frontend) layer from the User Service.
- **File Service:** The service manages references to files but does not handle file storage. It will assume a separate file service exists for uploading and storing the actual binary content.
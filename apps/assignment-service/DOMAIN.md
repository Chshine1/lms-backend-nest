# Domain Model – Assignment Service

## Overview

The Assignment Service manages the lifecycle of student work submissions. It handles the creation and submission of assignments, storage of submission data, and the teacher's review process including grading and feedback. This service is fundamental to the teaching and learning workflow within the LMS.

## Aggregates

### Submission (Root Aggregate)

The Submission is the main root aggregate. It represents a student's attempt at a specific assignment and serves as the consistency boundary for submission state changes.

**Responsibilities:**

- Manage submission identity and lifecycle
- Enforce submission state transitions
- Manage submission content (text and attachments)
- Coordinate with Review entity
- Enforce business invariants (one active submission per assignment)

**Transactional Boundary:**

The Submission aggregate boundary includes itself and its child Review entity. Changes to submission content and review are transactional.

## Entities

### Submission

**Identity:** `id` (generated)

**Attributes:**

| Field          | Type             | Description                                   |
| -------------- | ---------------- | --------------------------------------------- |
| enrollmentId   | number           | Reference to Enrollment in Enrollment Service |
| assignmentId   | number           | Reference to Assignment in Course Service     |
| submissionText | string           | Textual content of the submission             |
| attachments    | FileReference[]  | References to files in file service           |
| submittedAt    | Date             | Timestamp when submitted for grading          |
| status         | SubmissionStatus | State: DRAFT, SUBMITTED, GRADED               |

**Lifecycle:**

1. Created in DRAFT status
2. Updated while in DRAFT status
3. Submitted (transitions to SUBMITTED)
4. Reviewed by teacher (transitions to GRADED)

**State Transitions:**

```
DRAFT → (submit) → SUBMITTED → (review) → GRADED
  ↑              ↓
  └──────────────┘ (update allowed only in DRAFT)
```

**Invariants:**

- Only one active (DRAFT or SUBMITTED) submission per enrollment per assignment
- Cannot modify submission text or attachments after submission
- Status can only progress forward (DRAFT → SUBMITTED → GRADED)

### Review

**Identity:** `id` (generated)

**Attributes:**

| Field        | Type   | Description                          |
| ------------ | ------ | ------------------------------------ |
| submissionId | number | Reference to parent Submission       |
| teacherId    | number | Reference to teacher in User Service |
| score        | number | Numerical grade                      |
| feedback     | string | Teacher's textual feedback           |
| reviewedAt   | Date   | Timestamp of the review              |

**Lifecycle:**

- Created when teacher reviews a submission
- Updated to modify score or feedback

**Invariants:**

- Only one review per submission
- Teacher must be authorized to grade (assigned to the course)

## Value Objects

### FileReference

A lightweight object representing a reference to a file stored in an external file service.

**Attributes:**

| Field    | Type   | Description                       |
| -------- | ------ | --------------------------------- |
| fileId   | string | Unique identifier in file service |
| fileName | string | Original file name                |

**Characteristics:**

- Immutable
- Defined by attributes, not identity
- Validated for non-empty values

### SubmissionStatus

Enum representing the state of a submission.

**Values:**

- `DRAFT`: Initial state, can be edited
- `SUBMITTED`: Submitted for grading, cannot be edited
- `GRADED`: Has been reviewed and scored

## Domain Events

| Event Name             | Trigger                           | Data Payload                                                |
| ---------------------- | --------------------------------- | ----------------------------------------------------------- |
| `submission.created`   | New submission created as draft   | `{ submissionId, enrollmentId, assignmentId }`              |
| `submission.submitted` | Student submits draft for grading | `{ submissionId, enrollmentId, assignmentId, submittedAt }` |
| `submission.reviewed`  | Teacher adds review to submission | `{ submissionId, teacherId, score, reviewedAt }`            |
| `submission.updated`   | Draft submission updated          | `{ submissionId, changes }`                                 |

## Business Invariants

1. **One Active Submission**: A student (via enrollment) can have only one submission in DRAFT or SUBMITTED state for a given assignmentId. A new submission can only be created if no prior active submission exists.
2. **Submission-Enrollment Validity**: The enrollmentId must correspond to a valid enrollment where the student is enrolled in the course containing the assignment.
3. **Reviewer Permissions**: The teacherId in a Review must be a teacher assigned to the Course containing the assignment.
4. **Immutable After Grading**: Once a Submission is GRADED, submissionText and attachments cannot be modified.
5. **Single Review**: A Submission can have at most one Review.
6. **Valid Score Range**: Score must be within valid range (typically 0-100).

## Domain Services

### SubmissionValidationService

**Responsibilities:**

- Validate enrollment exists and is valid
- Check for existing active submissions
- Validate assignment exists

**Operations:**

- `validateEnrollment(enrollmentId: number): Promise<boolean>`
- `checkNoActiveSubmission(enrollmentId: number, assignmentId: number): Promise<boolean>`
- `validateAssignment(assignmentId: number): Promise<boolean>`

### SubmissionWorkflowService

**Responsibilities:**

- Handle submission state transitions
- Coordinate between Submission and Review

**Operations:**

- `createDraft(enrollmentId: number, assignmentId: number): Promise<Submission>`
- `submit(submissionId: number): Promise<Submission>`
- `grade(submissionId: number, review: Review): Promise<Submission>`

### ReviewValidationService

**Responsibilities:**

- Validate teacher authorization
- Validate score range

**Operations:**

- `validateTeacher(teacherId: number, courseId: number): Promise<boolean>`
- `validateScore(score: number): boolean`

## Relationships

```
Enrollment (external) ──────< (1) Submission ──────< (0..1) Review
                                        ↓
                               Assignment (external)
                                        ↓
                                       Course (external)
```

The Submission aggregate maintains references to Enrollment and Assignment, both external services. Review is a child entity within the Submission aggregate boundary.

## Notes

- File references are lightweight; actual file storage is handled by an external file service
- The service does not handle file upload/download; it only stores references
- Teacher authorization check may require calling Course Service to verify teacher assignment to course
- This service assumes the existence of file service for attachment storage
- Grade calculation and pass/fail determination are handled by frontend or higher-level services

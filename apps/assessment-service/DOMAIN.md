## Domain Model

### 1. Aggregates and Entities

#### 1.1 Assignment Aggregate

**Core Responsibility**: Manages the definition of a graded or non-graded task, including its flexible content
structure (Text vs. Quiz Problems). It encapsulates the rules for submission windows and resubmission limits. It **does
not** know about the specific answers a student gives; that is managed by the `Submission` aggregate.

| Member Type        | Member Name            | PostgreSQL Type  | Description / Domain Behavior                                                                                                         | Domain Constraints / Rules               |
| :----------------- | :--------------------- | :--------------- | :------------------------------------------------------------------------------------------------------------------------------------ | :--------------------------------------- |
| **Aggregate Root** | **Assignment**         | -                | Represents an evaluative task linked to a `CourseUnit`. (PRD Mapping: Assignments & Quizzes as same core entity)                      | -                                        |
| Field              | `id`                   | `BIGINT`         | Unique identifier.                                                                                                                    | `PRIMARY KEY`                            |
| Field              | `unitId`               | `BIGINT`         | References the `CourseUnit` from `course-service`. **External Reference.**                                                            | `NOT NULL`. Indexed.                     |
| Field              | `title`                | `VARCHAR(255)`   | Title of the assignment/quiz. (PRD Mapping: Assignment title)                                                                         | `NOT NULL`                               |
| Field              | `type`                 | `VARCHAR(20)`    | Discriminator for behavior: `TEXT_ENTRY` (Default Assignment) or `QUIZ`. (PRD Mapping: Different types)                               | `NOT NULL`                               |
| Field              | `content`              | `JSONB`          | **Modeled as `AssignmentContent` Value Object.** Stores structured blocks (Text, Choice, FillBlank). (PRD Mapping: Content, Problems) | `NOT NULL`                               |
| Field              | `dueTime`              | `TIMESTAMPTZ`    | Absolute deadline for submissions. (PRD Mapping: Due time)                                                                            | `NOT NULL`                               |
| Field              | `allowedResubmissions` | `INTEGER`        | Maximum number of attempts allowed (`-1` for unlimited). (PRD Mapping: Allowed resubmission counts)                                   | `NOT NULL`, `>= -1`                      |
| Field              | `totalGrade`           | `INTEGER`        | Maximum possible score. (PRD Mapping: Total grade)                                                                                    | `NOT NULL`, `> 0`                        |
| **Entity Method**  | `canAcceptSubmission`  | -                | Checks `dueTime` against current time. Returns `false` if late. (PRD Mapping: Must be before due time)                                | Throws `SubmissionWindowClosedException` |
| **Entity Method**  | `validateGradingScale` | `grade: integer` | Validates that a provided grade is between `0` and `totalGrade`.                                                                      | Throws `InvalidGradeException`           |

---

#### 1.2 AssignmentFile (Entity, Child of Assignment)

**Core Responsibility**: Represents an attachment/file associated with an assignment (e.g., assignment description
files, reference materials). Files are stored as separate entities with 1-N relationship to Assignment.

| Member Type       | Member Name        | PostgreSQL Type | Description / Domain Behavior                                                                                                                 | Domain Constraints / Rules                    |
| :---------------- | :----------------- | :-------------- | :-------------------------------------------------------------------------------------------------------------------------------------------- | :-------------------------------------------- |
| **Entity**        | **AssignmentFile** | -               | File attachment for a specific `Assignment`. (PRD Mapping: Assignment files)                                                                  | `FOREIGN KEY` to `Assignment`, cascade delete |
| Field             | `id`               | `BIGINT`        | Unique identifier.                                                                                                                            | `PRIMARY KEY`                                 |
| Field             | `assignmentId`     | `BIGINT`        | References `Assignment.id`.                                                                                                                   | `FOREIGN KEY`, `NOT NULL`, indexed            |
| Field             | `fileKey`          | `VARCHAR(512)`  | Path/key in storage backend (local or OSS). (PRD Mapping: File storage key)                                                                   | `NOT NULL`                                    |
| Field             | `fileName`         | `VARCHAR(255)`  | Original file name provided by user. (PRD Mapping: Original file name)                                                                        | `NOT NULL`                                    |
| Field             | `fileSize`         | `BIGINT`        | File size in bytes. (PRD Mapping: File size)                                                                                                  | `NOT NULL`, `>= 0`                            |
| Field             | `mimeType`         | `VARCHAR(100)`  | MIME type of the file. (PRD Mapping: File type)                                                                                               | `NOT NULL`                                    |
| Field             | `storageProvider`  | `VARCHAR(20)`   | Storage backend: `local` or `oss`. (PRD Mapping: Storage provider type)                                                                       | `NOT NULL`                                    |
| Field             | `uploadedAt`       | `TIMESTAMPTZ`   | Timestamp when file was uploaded.                                                                                                             | `NOT NULL`                                    |
| **Entity Method** | `getFileUrl`       | -               | Returns the URL for accessing the file. Uses the configured storage provider to generate signed URL or public URL. (PRD Mapping: File access) | Delegates to `FileStorageStrategy`            |

---

#### 1.3 Submission Aggregate

**Core Responsibility**: Represents a **single attempt** by a student for an assignment. Since history is not tracked (
only the last submission matters), this aggregate is **mutable**. It enforces the resubmission count limit and due date
on `update`. It manages the submission content but **does not** own files directly; file attachments are managed by
separate `SubmissionFile` entities.

| Member Type        | Member Name       | PostgreSQL Type | Description / Domain Behavior                                                                                                                                                                               | Domain Constraints / Rules                                                |
| :----------------- | :---------------- | :-------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :------------------------------------------------------------------------ |
| **Aggregate Root** | **Submission**    | -               | The latest state of a student's work on an `Assignment`. (PRD Mapping: Submissions, taking last submission suffices)                                                                                        | `UNIQUE(studentId, assignmentId)`                                         |
| Field              | `id`              | `BIGINT`        | Unique identifier.                                                                                                                                                                                          | `PRIMARY KEY`                                                             |
| Field              | `studentId`       | `BIGINT`        | References the student in `user-service`.                                                                                                                                                                   | `NOT NULL`                                                                |
| Field              | `assignmentId`    | `BIGINT`        | References the `Assignment`.                                                                                                                                                                                | `FOREIGN KEY`, `NOT NULL`                                                 |
| Field              | `content`         | `TEXT`          | Markdown string for text assignments; **JSON string** for Quiz answers. (PRD Mapping: Submission content, answers)                                                                                          | `NOT NULL`, Default `''`                                                  |
| Field              | `submissionCount` | `INTEGER`       | Tracks the number of times this submission has been updated/resubmitted. (PRD Mapping: Resubmission tracking)                                                                                               | `NOT NULL`, Default `1`                                                   |
| Field              | `submittedAt`     | `TIMESTAMPTZ`   | Timestamp of the **most recent** update.                                                                                                                                                                    | `NOT NULL`. Updated on every `updateContent`.                             |
| **Entity Method**  | `updateContent`   | `newContent`    | **Core Domain Logic:** Increments `submissionCount`. Checks `assignment.canAcceptSubmission()` and validates `submissionCount <= assignment.allowedResubmissions`. (PRD Mapping: Resubmission restrictions) | Throws `ResubmissionLimitExceededException` / `SubmissionClosedException` |

---

#### 1.4 SubmissionFile (Entity, Child of Submission)

**Core Responsibility**: Represents a file attachment for a submission. Files are stored as separate entities with 1-N
relationship to Submission. This allows for detailed metadata, easier testing, and flexible storage backend
configuration (local or OSS).

| Member Type       | Member Name        | PostgreSQL Type | Description / Domain Behavior                                                                                                                 | Domain Constraints / Rules                    |
| :---------------- | :----------------- | :-------------- | :-------------------------------------------------------------------------------------------------------------------------------------------- | :-------------------------------------------- |
| **Entity**        | **SubmissionFile** | -               | File attachment for a specific `Submission`. (PRD Mapping: Submission files)                                                                  | `FOREIGN KEY` to `Submission`, cascade delete |
| Field             | `id`               | `BIGINT`        | Unique identifier.                                                                                                                            | `PRIMARY KEY`                                 |
| Field             | `submissionId`     | `BIGINT`        | References `Submission.id`.                                                                                                                   | `FOREIGN KEY`, `NOT NULL`, indexed            |
| Field             | `fileKey`          | `VARCHAR(512)`  | Path/key in storage backend (local or OSS). (PRD Mapping: File storage key)                                                                   | `NOT NULL`                                    |
| Field             | `fileName`         | `VARCHAR(255)`  | Original file name provided by user. (PRD Mapping: Original file name)                                                                        | `NOT NULL`                                    |
| Field             | `fileSize`         | `BIGINT`        | File size in bytes. (PRD Mapping: File size)                                                                                                  | `NOT NULL`, `>= 0`                            |
| Field             | `mimeType`         | `VARCHAR(100)`  | MIME type of the file. (PRD Mapping: File type)                                                                                               | `NOT NULL`                                    |
| Field             | `storageProvider`  | `VARCHAR(20)`   | Storage backend: `local` or `oss`. (PRD Mapping: Storage provider type)                                                                       | `NOT NULL`                                    |
| Field             | `uploadedAt`       | `TIMESTAMPTZ`   | Timestamp when file was uploaded.                                                                                                             | `NOT NULL`                                    |
| **Entity Method** | `getFileUrl`       | -               | Returns the URL for accessing the file. Uses the configured storage provider to generate signed URL or public URL. (PRD Mapping: File access) | Delegates to `FileStorageStrategy`            |

---

#### 1.5 Review (Entity, Child of Submission)

**Core Responsibility**: A teacher's evaluation attached to a specific `Submission`. Exists only if a submission has
been graded or commented on.

| Member Type       | Member Name    | PostgreSQL Type | Description                                                                      | Domain Constraints / Rules                          |
| :---------------- | :------------- | :-------------- | :------------------------------------------------------------------------------- | :-------------------------------------------------- |
| Entity            | **Review**     | -               | Feedback provided by a teacher. (PRD Mapping: Teachers can review submissions)   | One-to-One relationship with `Submission`.          |
| Field             | `id`           | `BIGINT`        | Unique identifier.                                                               | `PRIMARY KEY`                                       |
| Field             | `submissionId` | `BIGINT`        | References `Submission.id`.                                                      | `FOREIGN KEY`, `UNIQUE` (One review per submission) |
| Field             | `reviewerId`   | `BIGINT`        | Teacher ID from `user-service`.                                                  | `NOT NULL`                                          |
| Field             | `grade`        | `INTEGER`       | Score awarded. Validated against `Assignment.totalGrade`. (PRD Mapping: Grading) | `CHECK (grade >= 0)`                                |
| Field             | `comment`      | `TEXT`          | Markdown feedback. (PRD Mapping: Comments along with grading)                    | Default `''`                                        |
| Field             | `reviewedAt`   | `TIMESTAMPTZ`   | Timestamp of review.                                                             | `NOT NULL`                                          |
| **Entity Method** | `updateGrade`  | -               | Updates the grade after validating scale.                                        | Throws `InvalidGradeException`                      |

---

### 2. Value Objects (Domain Primitives)

| Value Object        | Internal Representation | Invariants / Validation                                                                                                                                                                 | Behavior                          |
| :------------------ | :---------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :-------------------------------- |
| `AssignmentContent` | `Block[]` (JSONB)       | Array of `Block` objects. **Assignment (Text)**: Exactly 1 TextBlock. **Quiz**: 1..N blocks of type `Text`, `Choice`, `FillBlank`. (PRD Mapping: Expandable types, future auto-grading) | `getTotalProblems()`              |
| `ContentBlock`      | `{type, data}`          | **Choice**: options array, correctIndex (optional, for auto-grade expansion). **FillBlank**: correctAnswers array (optional). (PRD Mapping: Problems like choices/fill blanks)          | `validateAnswer(answer)` (Future) |

---

### 3. Application Layer (Orchestration)

| Application Service              | Method            | Input                                            | Output          | Dependencies / Notes                                                                                                                                                                              |
| :------------------------------- | :---------------- | :----------------------------------------------- | :-------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **SubmissionApplicationService** | `submit`          | `studentId`, `assignmentId`, `SubmissionDataDto` | `SubmissionDto` | **Idempotent Upsert.** Loads `Assignment`. Loads existing `Submission` or creates new one. Calls `submission.updateContent()`. Saves. (PRD Mapping: Students make submissions)                    |
| **ReviewApplicationService**     | `gradeSubmission` | `submissionId`, `reviewerId`, `GradeDto`         | `ReviewDto`     | Loads `Submission` and `Assignment`. Validates `reviewerId` is a teacher of the course (via `course-service` client). Creates/Updates `Review` entity. (PRD Mapping: Teachers review submissions) |

---

### 4. Domain Services (Encapsulated Business Rules)

| Domain Service           | Method           | Responsibility                                                                                                                                                                                                                        | Dependencies         |
| :----------------------- | :--------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | :------------------- |
| **GradingDomainService** | `calculateScore` | (Future Expansion) For Quiz types with multiple choice problems, this service will compare the `Submission.content` JSON against the `Assignment.content` answer key to automatically compute a `grade` without teacher intervention. | None (Pure function) |

---

### 5. Storage Services (File Storage Strategy)

**Strategy Pattern** for flexible file storage backends. Files can be stored locally or on OSS (Aliyun Object Storage
Service). The strategy is configurable via environment configuration, allowing easy switching between storage providers
without code changes.

| Service                                                                                      | Method               | Responsibility                                                              | Dependencies |
| :------------------------------------------------------------------------------------------- | :------------------- | :-------------------------------------------------------------------------- | :----------- |
| **FileStorageStrategy**                                                                      | `upload`             | Uploads a file to the configured storage backend. Returns the file key/path |
| in storage. (PRD Mapping: File upload)                                                       |
| `ConfigurationService`                                                                       |
| **FileStorageStrategy**                                                                      | `getUrl`             | Generates a URL for file access. For local storage, returns a signed URL    |
| with expiry. For OSS, returns a public or signed URL. (PRD Mapping: File access URL)         |
| `ConfigurationService`                                                                       |
| **FileStorageStrategy**                                                                      | `delete`             | Deletes a file from storage backend. (PRD Mapping: File                     |
| deletion)                                                                                    |
| `ConfigurationService`                                                                       |
| **FileStorageStrategy**                                                                      | `getProvider`        | Returns the current storage provider type (                                 |
| `local`                                                                                      |
| `oss`). Used to determine URL generation strategy. (PRD Mapping: Storage provider detection) | None (Pure function) |

**Strategy Implementation Notes**:

- **Local Storage**: Files stored in `./storage/uploads` directory. URLs are signed with expiry time.
- **OSS Storage**: Files uploaded to Aliyun OSS bucket. URLs can be public or signed based on configuration.
- **Configuration**: Driven by `StorageConfig.provider` in configuration. The strategy is injected as a dependency,
  making testing easy via mock implementations.

---

### 6. Domain Events

| Event Name                 | Payload Data                                | Triggering Point                                                                                     |
| :------------------------- | :------------------------------------------ | :--------------------------------------------------------------------------------------------------- |
| **SubmissionCreatedEvent** | `submissionId`, `studentId`, `assignmentId` | `SubmissionApplicationService.submit` on first creation.                                             |
| **SubmissionGradedEvent**  | `submissionId`, `studentId`, `grade`        | `ReviewApplicationService.gradeSubmission` after persistence. (PRD Mapping: Notify student of grade) |

---

### 7. Key Business Rules & Invariants

| Rule ID   | Description                                                                            | Enforcement Location                                                                                                   |
| :-------- | :------------------------------------------------------------------------------------- | :--------------------------------------------------------------------------------------------------------------------- |
| **BR-04** | A submission cannot be created or updated after `Assignment.dueTime`.                  | `Assignment.canAcceptSubmission()` called by `Submission.updateContent()`.                                             |
| **BR-05** | Resubmission count cannot exceed `Assignment.allowedResubmissions` (if not unlimited). | `Submission.updateContent()` checks internal `submissionCount` vs assignment limit.                                    |
| **BR-06** | Grade awarded cannot exceed `Assignment.totalGrade`.                                   | `Review.updateGrade()` validation.                                                                                     |
| **BR-07** | Only enrolled students can submit.                                                     | **External Enforcement:** API Gateway validates JWT containing enrollment claims derived from `course-service` events. |
| **BR-08** | Assignment files are cascade-deleted when Assignment is deleted.                       | Database `ON DELETE CASCADE` constraint.                                                                               |
| **BR-09** | Submission files are cascade-deleted when Submission is deleted.                       | Database `ON DELETE CASCADE` constraint.                                                                               |

---

### 8. Repository Interfaces (Conceptual)

```typescript
interface AssignmentRepository {
  save(assignment: Assignment): Promise<void>;

  findById(id: bigint): Promise<Assignment | null>;

  findByUnitId(unitId: bigint): Promise<Assignment[]>;
}

interface SubmissionRepository {
  save(submission: Submission): Promise<void>;

  findByStudentAndAssignment(
    studentId: bigint,
    assignmentId: bigint,
  ): Promise<Submission | null>;
}

interface SubmissionFileRepository {
  save(file: SubmissionFile): Promise<void>;

  findBySubmissionId(submissionId: bigint): Promise<SubmissionFile[]>;

  deleteBySubmissionId(submissionId: bigint): Promise<void>;
}

interface AssignmentFileRepository {
  save(file: AssignmentFile): Promise<void>;

  findByAssignmentId(assignmentId: bigint): Promise<AssignmentFile[]>;

  deleteByAssignmentId(assignmentId: bigint): Promise<void>;
}
```

---

### 8. Microservice Integration Note

- **`Course` & `Unit`** data is owned by `course-service`.
- This service maintains a **local read-only cache** of `CourseUnit` IDs and `Enrollment` status (synchronized via
  `StudentEnrolledEvent`).
- When `Assignment` is created, it only stores `unitId`. To check if a user is a **Teacher**, the Application Layer
  makes a lightweight gRPC/REST call to `course-service` at the moment of grading (as this is a less frequent,
  high-value operation).

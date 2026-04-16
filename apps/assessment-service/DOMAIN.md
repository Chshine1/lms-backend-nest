# Assessment Service Domain Model

## 0. Architecture Conventions

This domain follows zero-guess patterns for deterministic code generation. All aggregates inherit base schemas defining standard audit fields.

### Base Schema Inheritance

| Base Schema           | Inherited Fields                                                                     | Purpose                          |
| :-------------------- | :----------------------------------------------------------------------------------- | :------------------------------- |
| `AggregateRootSchema` | `id: BIGINT`, `createdAt: TIMESTAMPTZ`, `updatedAt: TIMESTAMPTZ`, `version: INTEGER` | Audit trail + optimistic locking |
| `EntitySchema`        | `id: BIGINT`, `createdAt: TIMESTAMPTZ`, `updatedAt: TIMESTAMPTZ`                     | Audit trail only                 |

### Conventions

- **ID Generation**: All entity IDs are `BIGINT` (PostgreSQL `BIGSERIAL`). Method signatures use `bigint` type.
- **Domain Events**: Recorded in aggregate methods via `_domainEvents[]` array. Published by repository after `flush()` to ensure atomicity.
- **Relationship Loading**: Collections are **empty by default**. Load explicitly via `include?: string[]` option in repository methods.
- **External References**: `unitId`, `studentId`, `reviewerId` stored as `BIGINT`. No local caching of external data except read-only enrollment status.
- **Uniqueness Constraints**: Defined at database level (e.g., `UNIQUE(studentId, assignmentId)` for submissions).
- **Cascade Delete**: Child entities (files, reviews) cascade-deleted when parent is deleted.

---

## 1. Aggregates and Entities

### 1.1 Assignment Aggregate

**Core Responsibility**: Manages the definition of a graded or non-graded task, including its flexible content structure (Text vs. Quiz Problems). Encapsulates rules for submission windows and resubmission limits. **Does not** know about student answers; managed by `Submission` aggregate.

| Member Type        | Member Name            | PostgreSQL Type | Description / Domain Behavior                                                                                                    | Domain Constraints / Rules             |
| :----------------- | :--------------------- | :-------------- | :------------------------------------------------------------------------------------------------------------------------------- | :------------------------------------- |
| extends            | `AggregateRootSchema`  | -               | Inherits `id`, `createdAt`, `updatedAt`, `version`                                                                               | -                                      |
| **Aggregate Root** | **Assignment**         | -               | Represents an evaluative task linked to a `CourseUnit`. (PRD Mapping: Assignments & Quizzes as same core entity)                 | -                                      |
| Field              | `unitId`               | `BIGINT`        | References the `CourseUnit` from `course-service`. **External Reference.**                                                       | `NOT NULL`. Indexed.                   |
| Field              | `title`                | `VARCHAR(255)`  | Title of the assignment/quiz. (PRD Mapping: Assignment title)                                                                    | `NOT NULL`                             |
| Field              | `type`                 | `VARCHAR(20)`   | Discriminator: `TEXT_ENTRY` (Text assignment) or `QUIZ`. (PRD Mapping: Different types)                                          | `NOT NULL`                             |
| Field              | `content`              | `JSONB`         | **Value Object: `AssignmentContent`.** Stores structured blocks (Text, Choice, FillBlank). **Future: Expandable for auto-grade** | `NOT NULL`                             |
| Field              | `dueTime`              | `TIMESTAMPTZ`   | Absolute deadline for submissions. (PRD Mapping: Due time)                                                                       | `NOT NULL`                             |
| Field              | `allowedResubmissions` | `INTEGER`       | Max attempts allowed (`-1` = unlimited). (PRD Mapping: Allowed resubmission counts)                                              | `NOT NULL`, `>= -1`                    |
| Field              | `totalGrade`           | `INTEGER`       | Maximum possible score. (PRD Mapping: Total grade)                                                                               | `NOT NULL`, `> 0`                      |
| **Method**         | `canAcceptSubmission`  | -               | Checks if current time is before `dueTime`. (PRD Mapping: Must be before due time)                                               | Returns `boolean`; throws on invalid   |
| **Method**         | `validateGradingScale` | -               | Validates grade is in range `[0, totalGrade]`. (PRD Mapping: Grade validation)                                                   | Throws `InvalidGradeException` on fail |

---

### 1.2 AssignmentFile (Entity, Child of Assignment)

**Core Responsibility**: Represents an attachment/file associated with an assignment (e.g., description files, reference materials). Files stored as separate entities with 1-N relationship to Assignment.

| Member Type | Member Name        | PostgreSQL Type | Description / Domain Behavior                                                                     | Domain Constraints / Rules                    |
| :---------- | :----------------- | :-------------- | :------------------------------------------------------------------------------------------------ | :-------------------------------------------- |
| extends     | `EntitySchema`     | -               | Inherits `id`, `createdAt`, `updatedAt`                                                           | -                                             |
| **Entity**  | **AssignmentFile** | -               | File attachment for a specific `Assignment`. (PRD Mapping: Assignment files)                      | `FOREIGN KEY` to `Assignment`, cascade delete |
| Field       | `assignmentId`     | `BIGINT`        | References `Assignment.id`.                                                                       | `FOREIGN KEY`, `NOT NULL`, indexed            |
| Field       | `fileKey`          | `VARCHAR(512)`  | Path/key in storage backend (local or OSS). (PRD Mapping: File storage key)                       | `NOT NULL`                                    |
| Field       | `fileName`         | `VARCHAR(255)`  | Original file name provided by user. (PRD Mapping: Original file name)                            | `NOT NULL`                                    |
| Field       | `fileSize`         | `BIGINT`        | File size in bytes. (PRD Mapping: File size)                                                      | `NOT NULL`, `>= 0`                            |
| Field       | `mimeType`         | `VARCHAR(100)`  | MIME type of the file. (PRD Mapping: File type)                                                   | `NOT NULL`                                    |
| Field       | `storageProvider`  | `VARCHAR(20)`   | Storage backend: `local` or `oss`. (PRD Mapping: Storage provider type)                           | `NOT NULL`                                    |
| Field       | `uploadedAt`       | `TIMESTAMPTZ`   | Timestamp when file was uploaded.                                                                 | `NOT NULL`                                    |
| **Method**  | `getFileUrl`       | -               | Returns URL for file access. Delegates to `FileStorageStrategy` for signed/public URL generation. | Returns `string`                              |

---

### 1.3 Submission Aggregate

**Core Responsibility**: Represents a **single (latest) attempt** by a student for an assignment. Mutable: enforces resubmission limit and due date on update. Manages submission content. **Does not** own files directly; managed by `SubmissionFile` entities.

| Member Type        | Member Name           | PostgreSQL Type | Description / Domain Behavior                                                                                                          | Domain Constraints / Rules                        |
| :----------------- | :-------------------- | :-------------- | :------------------------------------------------------------------------------------------------------------------------------------- | :------------------------------------------------ |
| extends            | `AggregateRootSchema` | -               | Inherits `id`, `createdAt`, `updatedAt`, `version`                                                                                     | -                                                 |
| **Aggregate Root** | **Submission**        | -               | Latest state of a student's work on an `Assignment`. (PRD Mapping: Submissions, only last matters)                                     | `UNIQUE(studentId, assignmentId)`                 |
| Field              | `studentId`           | `BIGINT`        | References the student in `user-service`.                                                                                              | `NOT NULL`                                        |
| Field              | `assignmentId`        | `BIGINT`        | References the `Assignment`.                                                                                                           | `FOREIGN KEY`, `NOT NULL`                         |
| Field              | `content`             | `TEXT`          | Markdown string for text submissions; **JSON string** for quiz answers. (PRD Mapping: Submission content, answers)                     | `NOT NULL`, Default `''`                          |
| Field              | `submissionCount`     | `INTEGER`       | Number of times submitted/updated. (PRD Mapping: Resubmission tracking)                                                                | `NOT NULL`, Default `1`                           |
| Field              | `submittedAt`         | `TIMESTAMPTZ`   | Timestamp of **most recent** update.                                                                                                   | `NOT NULL`. Updated on every `updateContent`.     |
| **Method**         | `updateContent`       | -               | Core domain logic: increment count, validate submission window and resubmission limit, record event. (PRD Mapping: Resubmission rules) | Throws `ResubmissionLimitExceededException`, etc. |

---

### 1.4 SubmissionFile (Entity, Child of Submission)

**Core Responsibility**: Represents a file attachment for a submission. Separate entities with 1-N relationship to Submission for metadata tracking and flexible storage configuration.

| Member Type | Member Name        | PostgreSQL Type | Description / Domain Behavior                                                                     | Domain Constraints / Rules                    |
| :---------- | :----------------- | :-------------- | :------------------------------------------------------------------------------------------------ | :-------------------------------------------- |
| extends     | `EntitySchema`     | -               | Inherits `id`, `createdAt`, `updatedAt`                                                           | -                                             |
| **Entity**  | **SubmissionFile** | -               | File attachment for a specific `Submission`. (PRD Mapping: Submission files)                      | `FOREIGN KEY` to `Submission`, cascade delete |
| Field       | `submissionId`     | `BIGINT`        | References `Submission.id`.                                                                       | `FOREIGN KEY`, `NOT NULL`, indexed            |
| Field       | `fileKey`          | `VARCHAR(512)`  | Path/key in storage backend (local or OSS). (PRD Mapping: File storage key)                       | `NOT NULL`                                    |
| Field       | `fileName`         | `VARCHAR(255)`  | Original file name provided by user. (PRD Mapping: Original file name)                            | `NOT NULL`                                    |
| Field       | `fileSize`         | `BIGINT`        | File size in bytes. (PRD Mapping: File size)                                                      | `NOT NULL`, `>= 0`                            |
| Field       | `mimeType`         | `VARCHAR(100)`  | MIME type of the file. (PRD Mapping: File type)                                                   | `NOT NULL`                                    |
| Field       | `storageProvider`  | `VARCHAR(20)`   | Storage backend: `local` or `oss`. (PRD Mapping: Storage provider type)                           | `NOT NULL`                                    |
| Field       | `uploadedAt`       | `TIMESTAMPTZ`   | Timestamp when file was uploaded.                                                                 | `NOT NULL`                                    |
| **Method**  | `getFileUrl`       | -               | Returns URL for file access. Delegates to `FileStorageStrategy` for signed/public URL generation. | Returns `string`                              |

---

### 1.5 Review (Entity, Child of Submission)

**Core Responsibility**: Represents a teacher's evaluation of a submission. Exists only if submission has been graded or commented on. One-to-one relationship with Submission.

| Member Type | Member Name    | PostgreSQL Type | Description                                                                      | Domain Constraints / Rules                          |
| :---------- | :------------- | :-------------- | :------------------------------------------------------------------------------- | :-------------------------------------------------- |
| extends     | `EntitySchema` | -               | Inherits `id`, `createdAt`, `updatedAt`                                          | -                                                   |
| **Entity**  | **Review**     | -               | Feedback provided by a teacher. (PRD Mapping: Teachers can review submissions)   | One-to-One relationship with `Submission`.          |
| Field       | `submissionId` | `BIGINT`        | References `Submission.id`.                                                      | `FOREIGN KEY`, `UNIQUE` (One review per submission) |
| Field       | `reviewerId`   | `BIGINT`        | Teacher ID from `user-service`.                                                  | `NOT NULL`                                          |
| Field       | `grade`        | `INTEGER`       | Score awarded. Validated against `Assignment.totalGrade`. (PRD Mapping: Grading) | `CHECK (grade >= 0)`                                |
| Field       | `comment`      | `TEXT`          | Markdown feedback. (PRD Mapping: Comments along with grading)                    | Default `''`                                        |
| Field       | `reviewedAt`   | `TIMESTAMPTZ`   | Timestamp of review.                                                             | `NOT NULL`                                          |
| **Method**  | `updateGrade`  | -               | Updates grade after validation. (PRD Mapping: Grade updates)                     | Throws `InvalidGradeException` on validation fail   |

---

## 2. Value Objects (Domain Primitives)

| Value Object        | Internal Representation | Invariants / Validation                                                                                                                                                        | Behavior                          |
| :------------------ | :---------------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :-------------------------------- |
| `AssignmentContent` | `Block[]` (JSONB)       | Array of `Block` objects. **Text Assignment**: Exactly 1 TextBlock. **Quiz**: 1..N blocks of type `Text`, `Choice`, `FillBlank`. **Future: Expandable types for auto-grading** | `getTotalProblems()`              |
| `ContentBlock`      | `{type, data}`          | **Choice**: options array, correctIndex (optional, future auto-grade). **FillBlank**: correctAnswers array (optional, future auto-grade). **Text**: simple string content      | `validateAnswer(answer)` (Future) |

---

## 3. Aggregate Root Methods: Implementation Patterns

### Assignment.canAcceptSubmission()

Validates that current time is before `dueTime`. Returns `true` if submission window is open.

```typescript
canAcceptSubmission(): boolean {
  const now = new Date();
  if (now > this.dueTime) {
    throw new SubmissionWindowClosedException({
      code: '2001',
      message: 'Submission window has closed',
      assignmentId: this.id,
      dueTime: this.dueTime,
      currentTime: now,
    });
  }
  return true;
}
```

### Assignment.validateGradingScale(grade: number)

Validates that grade is within `[0, totalGrade]` range. Throws on invalid grade.

```typescript
validateGradingScale(grade: number): void {
  if (grade < 0 || grade > this.totalGrade) {
    throw new InvalidGradeException({
      code: '2002',
      message: `Grade must be between 0 and ${this.totalGrade}`,
      assignmentId: this.id,
      providedGrade: grade,
      totalGrade: this.totalGrade,
    });
  }
}
```

### Submission.updateContent(newContent: string, assignment: Assignment)

Core domain logic: increments submission count, validates submission window and resubmission limit, records domain event.

```typescript
updateContent(newContent: string, assignment: Assignment): void {
  // Step 1: Check submission window
  assignment.canAcceptSubmission();

  // Step 2: Increment submission count
  this.submissionCount++;

  // Step 3: Check resubmission limit
  if (
    assignment.allowedResubmissions !== -1 &&
    this.submissionCount > assignment.allowedResubmissions
  ) {
    throw new ResubmissionLimitExceededException({
      code: '2003',
      message: 'Maximum resubmissions exceeded',
      submissionId: this.id,
      submissionCount: this.submissionCount,
      allowedResubmissions: assignment.allowedResubmissions,
    });
  }

  // Step 4: Update content and timestamp
  this.content = newContent;
  this.submittedAt = new Date();

  // Step 5: Record domain event
  if (this.submissionCount === 1) {
    this._domainEvents.push(
      new SubmissionCreatedEvent(this.id, this.studentId, this.assignmentId),
    );
  } else {
    this._domainEvents.push(
      new SubmissionUpdatedEvent(this.id, this.studentId, this.submissionCount),
    );
  }
}
```

### Review.updateGrade(newGrade: number, assignment: Assignment)

Updates grade after validating against assignment's grading scale.

```typescript
updateGrade(newGrade: number, assignment: Assignment): void {
  // Step 1: Validate grade scale
  assignment.validateGradingScale(newGrade);

  // Step 2: Update grade and timestamp
  this.grade = newGrade;
  this.reviewedAt = new Date();

  // Step 3: Record domain event
  this._domainEvents.push(
    new ReviewGradeUpdatedEvent(this.id, this.submissionId, newGrade),
  );
}
```

### AssignmentFile.getFileUrl()

Generates URL for file access. Delegates to `FileStorageStrategy`.

```typescript
getFileUrl(fileStorageStrategy: FileStorageStrategy): string {
  return fileStorageStrategy.getUrl(
    this.fileKey,
    this.storageProvider as 'local' | 'oss',
  );
}
```

### SubmissionFile.getFileUrl()

Generates URL for file access. Delegates to `FileStorageStrategy`.

```typescript
getFileUrl(fileStorageStrategy: FileStorageStrategy): string {
  return fileStorageStrategy.getUrl(
    this.fileKey,
    this.storageProvider as 'local' | 'oss',
  );
}
```

---

## 4. Domain Events and Dispatching Pattern

### Domain Event Recording (in Aggregates)

All aggregates maintain an internal event collection and provide methods for event lifecycle:

```typescript
// In Submission aggregate
protected _domainEvents: DomainEvent[] = [];

private recordEvent(event: DomainEvent): void {
  this._domainEvents.push(event);
}

getDomainEvents(): DomainEvent[] {
  return [...this._domainEvents]; // Defensive copy
}

clearDomainEvents(): void {
  this._domainEvents = [];
}
```

### Repository Publish Pattern (Event Dispatch)

After persisting aggregate to database, repository publishes all recorded events to event bus:

```typescript
// In SubmissionRepository
async save(submission: Submission): Promise<void> {
  // Step 1: Persist aggregate to database
  await this.entityManager.persist(submission).flush();

  // Step 2: Extract domain events
  const events = submission.getDomainEvents();

  // Step 3: Publish each event to event bus
  for (const event of events) {
    await this.eventBus.publish(event);
  }

  // Step 4: Clear events from aggregate (ensures idempotency)
  submission.clearDomainEvents();
}
```

### Domain Events

| Event Name                  | Payload Data                                                           | Triggering Point                                                                  |
| :-------------------------- | :--------------------------------------------------------------------- | :-------------------------------------------------------------------------------- |
| **SubmissionCreatedEvent**  | `submissionId: bigint`, `studentId: bigint`, `assignmentId: bigint`    | `SubmissionApplicationService.submit()` on first creation (submissionCount === 1) |
| **SubmissionUpdatedEvent**  | `submissionId: bigint`, `studentId: bigint`, `submissionCount: number` | `Submission.updateContent()` on subsequent updates (submissionCount > 1)          |
| **SubmissionGradedEvent**   | `submissionId: bigint`, `studentId: bigint`, `grade: number`           | `ReviewApplicationService.gradeSubmission()` after Review persisted               |
| **ReviewGradeUpdatedEvent** | `reviewId: bigint`, `submissionId: bigint`, `grade: number`            | `Review.updateGrade()` after grade updated                                        |

---

## 5. Application Layer (Orchestration)

### 5.1 SubmissionApplicationService.submit()

**Responsibility**: Idempotent upsert of student submission. Loads or creates submission, updates content, persists, publishes events.

#### Input: `SubmitSubmissionInput`

| Field          | Type                    | Constraints / Validation |
| :------------- | :---------------------- | :----------------------- |
| `studentId`    | `bigint`                | Required                 |
| `assignmentId` | `bigint`                | Required                 |
| `content`      | `string`                | Required, non-empty      |
| `files`        | `SubmissionFileInput[]` | Optional, min length 0   |

#### `SubmissionFileInput` (nested in `files` array)

| Field             | Type               | Constraints / Validation           |
| :---------------- | :----------------- | :--------------------------------- |
| `fileKey`         | `string`           | Required, non-empty                |
| `fileName`        | `string`           | Required, non-empty                |
| `fileSize`        | `number`           | Required, ≥ 0                      |
| `mimeType`        | `string`           | Required                           |
| `storageProvider` | `'local' \| 'oss'` | Required, one of enumerated values |

#### Output: `SubmissionDto`

| Field             | Type     | Description                     |
| :---------------- | :------- | :------------------------------ |
| `id`              | `bigint` | Submission identifier           |
| `studentId`       | `bigint` | Student reference               |
| `assignmentId`    | `bigint` | Assignment reference            |
| `content`         | `string` | Submission content              |
| `submissionCount` | `number` | Number of submission attempts   |
| `submittedAt`     | `Date`   | Timestamp of most recent update |
| `createdAt`       | `Date`   | Creation timestamp              |
| `updatedAt`       | `Date`   | Last update timestamp           |
| `version`         | `number` | Optimistic locking version      |

#### Orchestration Steps

```typescript
async submit(input: SubmitSubmissionInput): Promise<SubmissionDto> {
  // 1. Load Assignment by ID; throw 2005 if not found
  const assignment = await this.assignmentRepository.findById(
    input.assignmentId,
  );
  if (!assignment) {
    throw new AssignmentNotFoundException({
      code: '2005',
      assignmentId: input.assignmentId,
    });
  }

  // 2. Load existing Submission or create new one
  let submission = await this.submissionRepository.findByStudentAndAssignment(
    input.studentId,
    input.assignmentId,
  );
  if (!submission) {
    submission = new Submission(
      input.studentId,
      input.assignmentId,
      '',
      1,
      new Date(),
    );
  }

  // 3. Call submission.updateContent() (validates and records event)
  submission.updateContent(input.content, assignment);

  // 4. Save submission (persists + publishes domain events)
  await this.submissionRepository.save(submission);

  // 5. If files provided, save to SubmissionFileRepository
  if (input.files && input.files.length > 0) {
    for (const fileInput of input.files) {
      const submissionFile = new SubmissionFile(
        submission.id,
        fileInput.fileKey,
        fileInput.fileName,
        fileInput.fileSize,
        fileInput.mimeType,
        fileInput.storageProvider,
        new Date(),
      );
      await this.submissionFileRepository.save(submissionFile);
    }
  }

  // 6. Return SubmissionDto
  return this.toSubmissionDto(submission);
}
```

---

### 5.2 ReviewApplicationService.gradeSubmission()

**Responsibility**: Create or update a review with grade and feedback. Validates reviewer is teacher, validates grade, publishes grading event.

#### Input: `GradeSubmissionInput`

| Field          | Type     | Constraints / Validation  |
| :------------- | :------- | :------------------------ |
| `submissionId` | `bigint` | Required                  |
| `reviewerId`   | `bigint` | Required                  |
| `grade`        | `number` | Required, ≥ 0             |
| `comment`      | `string` | Optional, max length 2000 |

#### Output: `ReviewDto`

| Field          | Type     | Description           |
| :------------- | :------- | :-------------------- |
| `id`           | `bigint` | Review identifier     |
| `submissionId` | `bigint` | Submission reference  |
| `reviewerId`   | `bigint` | Teacher reference     |
| `grade`        | `number` | Awarded score         |
| `comment`      | `string` | Feedback text         |
| `reviewedAt`   | `Date`   | Review timestamp      |
| `createdAt`    | `Date`   | Creation timestamp    |
| `updatedAt`    | `Date`   | Last update timestamp |

#### Orchestration Steps

```typescript
async gradeSubmission(input: GradeSubmissionInput): Promise<ReviewDto> {
  // 1. Load Submission by ID; throw 2006 if not found
  const submission = await this.submissionRepository.findById(
    input.submissionId,
  );
  if (!submission) {
    throw new SubmissionNotFoundException({
      code: '2006',
      submissionId: input.submissionId,
    });
  }

  // 2. Load Assignment by ID; throw 2005 if not found
  const assignment = await this.assignmentRepository.findById(
    submission.assignmentId,
  );
  if (!assignment) {
    throw new AssignmentNotFoundException({
      code: '2005',
      assignmentId: submission.assignmentId,
    });
  }

  // 3. Verify reviewer is a teacher of the course
  const isTeacher = await this.courseServiceClient.isTeacherOfUnit(
    input.reviewerId,
    assignment.unitId,
  );
  if (!isTeacher) {
    throw new UnauthorizedReviewException({
      code: '2008',
      reviewerId: input.reviewerId,
      unitId: assignment.unitId,
    });
  }

  // 4. Load existing Review or create new one
  let review = await this.reviewRepository.findBySubmissionId(
    input.submissionId,
  );
  if (!review) {
    review = new Review(
      input.submissionId,
      input.reviewerId,
      0,
      input.comment ?? '',
      new Date(),
    );
  }

  // 5. Update grade (validates and records event)
  review.updateGrade(input.grade, assignment);
  if (input.comment) {
    review.comment = input.comment;
  }

  // 6. Save review (persists + publishes domain events)
  await this.reviewRepository.save(review);

  // 7. Return ReviewDto
  return this.toReviewDto(review);
}
```

---

### 5.3 AssignmentApplicationService.createAssignment()

#### Input: `CreateAssignmentInput`

| Field                  | Type                     | Constraints / Validation           |
| :--------------------- | :----------------------- | :--------------------------------- |
| `unitId`               | `bigint`                 | Required                           |
| `title`                | `string`                 | Required, non-empty, max 255 chars |
| `type`                 | `'TEXT_ENTRY' \| 'QUIZ'` | Required, one of enumerated values |
| `content`              | `AssignmentContent`      | Required (object)                  |
| `dueTime`              | `Date`                   | Required                           |
| `allowedResubmissions` | `number`                 | Required, ≥ -1                     |
| `totalGrade`           | `number`                 | Required, ≥ 1                      |

#### Output: `AssignmentDto`

| Field                  | Type                     | Description                |
| :--------------------- | :----------------------- | :------------------------- |
| `id`                   | `bigint`                 | Assignment identifier      |
| `unitId`               | `bigint`                 | Course unit reference      |
| `title`                | `string`                 | Assignment title           |
| `type`                 | `'TEXT_ENTRY' \| 'QUIZ'` | Assignment type            |
| `content`              | `AssignmentContent`      | Structured content         |
| `dueTime`              | `Date`                   | Submission deadline        |
| `allowedResubmissions` | `number`                 | Max attempts allowed       |
| `totalGrade`           | `number`                 | Maximum score              |
| `createdAt`            | `Date`                   | Creation timestamp         |
| `updatedAt`            | `Date`                   | Last update timestamp      |
| `version`              | `number`                 | Optimistic locking version |

---

## 6. Domain Services (Encapsulated Business Rules)

| Domain Service           | Method           | Responsibility                                                                                                                                                                                                                          | Dependencies         |
| :----------------------- | :--------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :------------------- |
| **GradingDomainService** | `calculateScore` | **(Future Expansion)** For Quiz types with multiple choice problems, compares `Submission.content` JSON against `Assignment.content` answer key to auto-compute `grade` without teacher intervention. Currently placeholder for design. | None (Pure function) |

---

## 7. Storage Services (File Storage Strategy)

**Strategy Pattern** for flexible file storage backends (local or Aliyun OSS). Configurable via environment, allowing switching without code changes.

| Service               | Method        | Responsibility                                                                              | Dependencies           |
| :-------------------- | :------------ | :------------------------------------------------------------------------------------------ | :--------------------- |
| `FileStorageStrategy` | `upload`      | Uploads file to configured backend. Returns file key/path in storage.                       | `ConfigurationService` |
| `FileStorageStrategy` | `getUrl`      | Generates signed/public URL for file access. Local: signed with expiry. OSS: public/signed. | `ConfigurationService` |
| `FileStorageStrategy` | `delete`      | Deletes file from storage backend.                                                          | `ConfigurationService` |
| `FileStorageStrategy` | `getProvider` | Returns current storage provider type (`local` or `oss`). Used for URL generation logic.    | None (Pure function)   |

**Implementation Notes**:

- **Local Storage**: Files in `./storage/uploads`. URLs signed with expiry.
- **OSS Storage**: Files in Aliyun OSS bucket. URLs public or signed based on config.
- **Configuration**: Driven by `StorageConfig.provider`. Injected as dependency for testability.

---

## 8. Key Business Rules & Invariants

| Rule ID   | Description                                                                            | Enforcement Location                                                                                                   |
| :-------- | :------------------------------------------------------------------------------------- | :--------------------------------------------------------------------------------------------------------------------- |
| **BR-04** | A submission cannot be created or updated after `Assignment.dueTime`.                  | `Assignment.canAcceptSubmission()` called by `Submission.updateContent()`.                                             |
| **BR-05** | Resubmission count cannot exceed `Assignment.allowedResubmissions` (if not unlimited). | `Submission.updateContent()` checks internal `submissionCount` vs assignment limit.                                    |
| **BR-06** | Grade awarded cannot exceed `Assignment.totalGrade`.                                   | `Review.updateGrade()` validation.                                                                                     |
| **BR-07** | Only enrolled students can submit.                                                     | **External Enforcement:** API Gateway validates JWT containing enrollment claims derived from `course-service` events. |
| **BR-08** | Assignment files are cascade-deleted when Assignment is deleted.                       | Database `ON DELETE CASCADE` constraint.                                                                               |
| **BR-09** | Submission files are cascade-deleted when Submission is deleted.                       | Database `ON DELETE CASCADE` constraint.                                                                               |

---

## 9. Repository Interfaces

All repositories follow standard patterns with event dispatch on save.

```typescript
interface AssignmentRepository {
  save(assignment: Assignment): Promise<void>;

  findById(
    id: bigint,
    options?: { include?: string[] },
  ): Promise<Assignment | null>;

  findByUnitId(unitId: bigint): Promise<Assignment[]>;
}

interface SubmissionRepository {
  save(submission: Submission): Promise<void>;

  findById(
    id: bigint,
    options?: { include?: string[] },
  ): Promise<Submission | null>;

  findByStudentAndAssignment(
    studentId: bigint,
    assignmentId: bigint,
    options?: { include?: string[] },
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

interface ReviewRepository {
  save(review: Review): Promise<void>;

  findBySubmissionId(submissionId: bigint): Promise<Review | null>;

  findById(id: bigint): Promise<Review | null>;
}
```

---

## 10. Error Codes & Exceptions

All exceptions use 4-digit codes in range `2001-2099` (assessment-service range). Codes trigger specific HTTP status responses.

| Exception Name                       | Code   | Trigger Condition                                                                    | HTTP Status       |
| :----------------------------------- | :----- | :----------------------------------------------------------------------------------- | :---------------- |
| `SubmissionWindowClosedException`    | `2001` | Current time > `Assignment.dueTime` when submitting                                  | 409 (Conflict)    |
| `InvalidGradeException`              | `2002` | Grade < 0 OR Grade > `Assignment.totalGrade`                                         | 400 (Bad Request) |
| `ResubmissionLimitExceededException` | `2003` | `submissionCount > assignment.allowedResubmissions` AND `allowedResubmissions != -1` | 409 (Conflict)    |
| `SubmissionClosedException`          | `2004` | Attempt to update submission after deadline                                          | 409 (Conflict)    |
| `AssignmentNotFoundException`        | `2005` | Assignment not found by ID in database                                               | 404 (Not Found)   |
| `SubmissionNotFoundException`        | `2006` | Submission not found by ID in database                                               | 404 (Not Found)   |
| `ReviewNotFoundException`            | `2007` | Review not found by submission ID in database                                        | 404 (Not Found)   |
| `UnauthorizedReviewException`        | `2008` | Non-teacher attempting to grade submission                                           | 403 (Forbidden)   |

**Exception Construction Pattern**:

```typescript
throw new SubmissionWindowClosedException({
  code: '2001',
  message: 'Submission window has closed',
  assignmentId: this.id,
  dueTime: this.dueTime,
});
```

---

## 11. Data Transfer Objects (DTOs)

All DTOs are plain objects with the following structure and validation rules. The actual validation mechanism (e.g., `class-validator`, `zod`, `io-ts`) is an implementation detail.

### 11.1 SubmitSubmissionInput

| Field          | Type                    | Validation             |
| :------------- | :---------------------- | :--------------------- |
| `studentId`    | `bigint`                | required               |
| `assignmentId` | `bigint`                | required               |
| `content`      | `string`                | required, non-empty    |
| `files`        | `SubmissionFileInput[]` | optional, min length 0 |

### 11.2 SubmissionFileInput

| Field             | Type               | Validation                      |
| :---------------- | :----------------- | :------------------------------ |
| `fileKey`         | `string`           | required, non-empty             |
| `fileName`        | `string`           | required, non-empty             |
| `fileSize`        | `number`           | required, ≥ 0                   |
| `mimeType`        | `string`           | required                        |
| `storageProvider` | `'local' \| 'oss'` | required, one of allowed values |

### 11.3 SubmissionDto

| Field             | Type     |
| :---------------- | :------- |
| `id`              | `bigint` |
| `studentId`       | `bigint` |
| `assignmentId`    | `bigint` |
| `content`         | `string` |
| `submissionCount` | `number` |
| `submittedAt`     | `Date`   |
| `createdAt`       | `Date`   |
| `updatedAt`       | `Date`   |
| `version`         | `number` |

### 11.4 GradeSubmissionInput

| Field          | Type     | Validation                |
| :------------- | :------- | :------------------------ |
| `submissionId` | `bigint` | required                  |
| `reviewerId`   | `bigint` | required                  |
| `grade`        | `number` | required, ≥ 0             |
| `comment`      | `string` | optional, max length 2000 |

### 11.5 ReviewDto

| Field          | Type     |
| :------------- | :------- |
| `id`           | `bigint` |
| `submissionId` | `bigint` |
| `reviewerId`   | `bigint` |
| `grade`        | `number` |
| `comment`      | `string` |
| `reviewedAt`   | `Date`   |
| `createdAt`    | `Date`   |
| `updatedAt`    | `Date`   |

### 11.6 CreateAssignmentInput

| Field                  | Type                     | Validation                      |
| :--------------------- | :----------------------- | :------------------------------ |
| `unitId`               | `bigint`                 | required                        |
| `title`                | `string`                 | required, non-empty, max 255    |
| `type`                 | `'TEXT_ENTRY' \| 'QUIZ'` | required, one of allowed values |
| `content`              | `AssignmentContent`      | required (object)               |
| `dueTime`              | `Date`                   | required                        |
| `allowedResubmissions` | `number`                 | required, ≥ -1                  |
| `totalGrade`           | `number`                 | required, ≥ 1                   |

### 11.7 AssignmentDto

| Field                  | Type                     |
| :--------------------- | :----------------------- |
| `id`                   | `bigint`                 |
| `unitId`               | `bigint`                 |
| `title`                | `string`                 |
| `type`                 | `'TEXT_ENTRY' \| 'QUIZ'` |
| `content`              | `AssignmentContent`      |
| `dueTime`              | `Date`                   |
| `allowedResubmissions` | `number`                 |
| `totalGrade`           | `number`                 |
| `createdAt`            | `Date`                   |
| `updatedAt`            | `Date`                   |
| `version`              | `number`                 |

---

## 12. Query Operations

All query operations are read-only and return DTOs. Relationship loading uses explicit `include` option.

```typescript
interface AssignmentQueryService {
  // Load assignment without files
  getAssignmentById(id: bigint): Promise<AssignmentDto | null>;

  // Load assignment with files
  getAssignmentByIdWithFiles(
    id: bigint,
  ): Promise<AssignmentWithFilesDto | null>;

  // Find all assignments for a course unit
  getAssignmentsByUnitId(unitId: bigint): Promise<AssignmentDto[]>;
}

interface SubmissionQueryService {
  // Load submission without files/review
  getSubmissionById(id: bigint): Promise<SubmissionDto | null>;

  // Load submission with files and review
  getSubmissionWithDetails(
    id: bigint,
  ): Promise<SubmissionWithDetailsDto | null>;

  // Find submission by student and assignment
  getSubmissionByStudentAndAssignment(
    studentId: bigint,
    assignmentId: bigint,
  ): Promise<SubmissionDto | null>;

  // List all submissions for an assignment
  getSubmissionsByAssignmentId(assignmentId: bigint): Promise<SubmissionDto[]>;

  // List all submissions for a student
  getSubmissionsByStudentId(studentId: bigint): Promise<SubmissionDto[]>;
}

interface ReviewQueryService {
  // Get review for a submission
  getReviewBySubmissionId(submissionId: bigint): Promise<ReviewDto | null>;

  // Get review by ID
  getReviewById(id: bigint): Promise<ReviewDto | null>;

  // List all reviews for an assignment
  getReviewsByAssignmentId(assignmentId: bigint): Promise<ReviewDto[]>;
}
```

---

## 13. Aggregate Root Relationship Loading (ORM Pattern)

Collections are **empty by default**. Load relationships only via explicit `include` option to avoid N+1 queries.

### Pattern

Repository methods accept optional `include` parameter to eagerly load relationships:

```typescript
async findById(
  id: bigint,
  options?: { include?: string[] },
): Promise<Assignment | null> {
  let query = this.entityManager
    .createQueryBuilder(Assignment, 'a')
    .where('a.id = :id', { id });

  // Conditionally join relationships based on include array
  if (options?.include?.includes('files')) {
    query = query.leftJoinAndSelect('a.files', 'af');
  }

  return query.getOne() ?? null;
}
```

### Usage Examples

#### Assignment Relationship Loading

```typescript
// Load assignment WITHOUT files (empty collection by default)
const assignment = await assignmentRepository.findById(123n);
console.log(assignment.files); // [] (empty)

// Load assignment WITH files eagerly
const assignment = await assignmentRepository.findById(123n, {
  include: ['files'],
});
console.log(assignment.files); // [AssignmentFile, AssignmentFile, ...]
```

#### Submission Relationship Loading

```typescript
// Load submission WITHOUT files/review (empty by default)
const submission = await submissionRepository.findById(456n);
console.log(submission.files); // [] (empty)
console.log(submission.review); // null

// Load submission WITH files
const submission = await submissionRepository.findById(456n, {
  include: ['files'],
});
console.log(submission.files); // [SubmissionFile, ...]
console.log(submission.review); // null

// Load submission WITH review
const submission = await submissionRepository.findById(456n, {
  include: ['review'],
});
console.log(submission.review); // Review | null

// Load submission with BOTH files and review
const submission = await submissionRepository.findById(456n, {
  include: ['files', 'review'],
});
console.log(submission.files); // [SubmissionFile, ...]
console.log(submission.review); // Review | null
```

#### Query Service Examples (Convenience Methods)

```typescript
// Convenience query service methods eliminate boilerplate

// Load with files
const assignment =
  await assignmentQueryService.getAssignmentByIdWithFiles(123n);

// Load submission with all details
const submission = await submissionQueryService.getSubmissionWithDetails(456n);
```

---

## 14. Microservice Integration Note

- **`Course` & `Unit`** data owned by `course-service`.
- This service maintains **local read-only cache** of `CourseUnit` IDs and `Enrollment` status (synchronized via `StudentEnrolledEvent`).
- When `Assignment` created, stores only `unitId`. To verify **Teacher** role, Application Layer makes lightweight gRPC/REST call to `course-service` at grading time (less frequent, high-value operation).
- **Events Published**: `SubmissionCreatedEvent`, `SubmissionUpdatedEvent`, `SubmissionGradedEvent`, `ReviewGradeUpdatedEvent`.
- **Events Consumed**: `StudentEnrolledEvent` (from `course-service`), `TeacherAssignedEvent` (from `course-service`).

I'll identify the sections that contain hard-coded DTO/validation classes and replace them with table-based descriptions to avoid framework-specific implementation details (like `class-validator` decorators). This makes the specification more portable (e.g., switching to Zod requires only updating the implementation layer, not the domain model doc).

**Sections to be modified:**

- **Section 5 (Application Layer)** – Input/Output DTOs are currently defined as TypeScript classes with validation decorators.
- **Section 11 (Data Transfer Objects)** – The same DTOs are repeated with full decorator listings.

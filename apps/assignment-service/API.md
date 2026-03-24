# Assignment Service – Public API

## Purpose

Manages assignment submissions and reviews. Provides APIs for students to create and submit assignments, and for teachers to review and grade submissions.

## Exported Services

### SubmissionService

The main service exposed by this module for managing submissions.

**Student Operations:**

| Method                                   | Parameters                                             | Return Type                   | Description                                |
| ---------------------------------------- | ------------------------------------------------------ | ----------------------------- | ------------------------------------------ |
| `createSubmission`                       | `createSubmissionDto: CreateSubmissionDto`             | `Promise<Submission>`         | Create a new draft submission              |
| `updateSubmission`                       | `id: number, updateSubmissionDto: UpdateSubmissionDto` | `Promise<Submission>`         | Update draft submission                    |
| `submitAssignment`                       | `id: number`                                           | `Promise<Submission>`         | Submit draft for grading                   |
| `getSubmissionByEnrollmentAndAssignment` | `enrollmentId: number, assignmentId: number`           | `Promise<Submission \| null>` | Get student's submission for an assignment |

**Teacher Operations:**

| Method                       | Parameters                                               | Return Type               | Description                           |
| ---------------------------- | -------------------------------------------------------- | ------------------------- | ------------------------------------- |
| `getSubmissionsByAssignment` | `assignmentId: number`                                   | `Promise<Submission[]>`   | Get all submissions for an assignment |
| `createReview`               | `submissionId: number, createReviewDto: CreateReviewDto` | `Promise<Review>`         | Add review to submission              |
| `updateReview`               | `submissionId: number, updateReviewDto: UpdateReviewDto` | `Promise<Review>`         | Update existing review                |
| `getReviewBySubmission`      | `submissionId: number`                                   | `Promise<Review \| null>` | Get review for a submission           |

## Exported Types

### SubmissionStatus (Enum)

```typescript
enum SubmissionStatus {
  DRAFT = 'DRAFT',
  SUBMITTED = 'SUBMITTED',
  GRADED = 'GRADED',
}
```

### CreateSubmissionDto

```typescript
class CreateSubmissionDto {
  @IsDefined()
  @IsNumber()
  enrollmentId!: number;

  @IsDefined()
  @IsNumber()
  assignmentId!: string;

  @IsString()
  submissionText?: string;

  @IsArray()
  @IsOptional()
  attachments?: FileReference[];
}
```

### UpdateSubmissionDto

```typescript
class UpdateSubmissionDto {
  @IsString()
  submissionText?: string;

  @IsArray()
  @IsOptional()
  attachments?: FileReference[];
}
```

### CreateReviewDto

```typescript
class CreateReviewDto {
  @IsDefined()
  @IsNumber()
  teacherId!: number;

  @IsDefined()
  @IsNumber()
  score!: number;

  @IsString()
  feedback!: string;
}
```

### UpdateReviewDto

```typescript
class UpdateReviewDto {
  @IsNumber()
  score?: number;

  @IsString()
  feedback?: string;
}
```

### FileReference (Value Object)

```typescript
class FileReference {
  fileId!: string;
  fileName!: string;
}
```

### Submission (Entity)

```typescript
class Submission {
  id!: number;
  enrollmentId!: number;
  assignmentId!: number;
  submissionText?: string;
  attachments?: FileReference[];
  submittedAt?: Date;
  status!: SubmissionStatus;
  createdAt!: Date;
  updatedAt!: Date;
}
```

### Review (Entity)

```typescript
class Review {
  id!: number;
  submissionId!: number;
  teacherId!: number;
  score!: number;
  feedback!: string;
  reviewedAt!: Date;
  createdAt!: Date;
  updatedAt!: Date;
}
```

## Usage Example

```typescript
import { Module } from '@nestjs/common';
import { AssignmentModule } from '@app/assignment';

@Module({
  imports: [AssignmentModule],
  controllers: [SomeController],
})
export class SomeModule {}
```

```typescript
constructor(
  private readonly submissionService: SubmissionService,
) {}

async createSubmission() {
  const submission = await this.submissionService.createSubmission({
    enrollmentId: 1,
    assignmentId: 10,
    submissionText: 'My answer is...',
  });
}

async submitAssignment(submissionId: number) {
  const submitted = await this.submissionService.submitAssignment(submissionId);
}

async createReview(submissionId: number) {
  const review = await this.submissionService.createReview(submissionId, {
    teacherId: 5,
    score: 85,
    feedback: 'Good work!',
  });
}
```

## Configuration

No special configuration required. Standard NestJS module configuration applies.

## Error Handling

| Error Code                 | Description                                               |
| -------------------------- | --------------------------------------------------------- |
| `NOT_FOUND`                | Submission or review not found                            |
| `VALIDATION_ERROR`         | Invalid submission or review data                         |
| `ALREADY_SUBMITTED`        | Submission already submitted                              |
| `ALREADY_GRADED`           | Cannot modify graded submission                           |
| `ACTIVE_SUBMISSION_EXISTS` | Student already has active submission for this assignment |
| `ENROLLMENT_NOT_FOUND`     | Referenced enrollment does not exist                      |
| `TEACHER_NOT_AUTHORIZED`   | Teacher not assigned to this course                       |

## Notes

- Submissions in DRAFT status can be updated
- Once SUBMITTED or GRADED, submissions cannot be modified
- Only one active (DRAFT or SUBMITTED) submission allowed per student per assignment
- Reviews can only be created once per submission
- Graded submissions cannot be modified but reviews can be updated

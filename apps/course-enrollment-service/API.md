# Course Enrollment Service – Public API

## Purpose

Manages student course enrollments. Provides APIs for enrolling students, retrieving enrollment information by course or student, and unenrolling students.

## Exported Services

### CourseEnrollmentService

The main service exposed by this module for managing enrollments.

**Methods:**

| Method                       | Parameters                                 | Return Type             | Description                             |
| ---------------------------- | ------------------------------------------ | ----------------------- | --------------------------------------- |
| `enrollStudent`              | `createEnrollmentDto: CreateEnrollmentDto` | `Promise<Enrollment>`   | Enroll a student in a course            |
| `getEnrollmentsByCourse`     | `courseId: number`                         | `Promise<Enrollment[]>` | Get all enrollments for a course        |
| `getEnrollmentsByStudent`    | `studentId: number`                        | `Promise<Enrollment[]>` | Get all courses for a student           |
| `getEnrollmentById`          | `id: number`                               | `Promise<Enrollment>`   | Get a specific enrollment               |
| `unenrollStudent`            | `id: number`                               | `Promise<void>`         | Remove a student from a course          |
| `unenrollByStudentAndCourse` | `studentId: number, courseId: number`      | `Promise<void>`         | Remove enrollment by student and course |

## Exported Types

### CreateEnrollmentDto

```typescript
class CreateEnrollmentDto {
  @IsDefined()
  @IsNumber()
  studentId!: number;

  @IsDefined()
  @IsNumber()
  courseId!: number;
}
```

### Enrollment (Entity)

```typescript
class Enrollment {
  id!: number;
  studentId!: number;
  courseId!: number;
  enrolledAt!: Date;
  createdAt!: Date;
  updatedAt!: Date;
  deletedAt?: Date;
}
```

## Usage Example

```typescript
import { Module } from '@nestjs/common';
import { CourseEnrollmentModule } from '@app/course-enrollment';

@Module({
  imports: [CourseEnrollmentModule],
  controllers: [SomeController],
})
export class SomeModule {}
```

```typescript
constructor(
  private readonly enrollmentService: CourseEnrollmentService,
) {}

async enrollStudent() {
  const enrollment = await this.enrollmentService.enrollStudent({
    studentId: 123,
    courseId: 456,
  });
}

async getStudentCourses(studentId: number) {
  const courses = await this.enrollmentService.getEnrollmentsByStudent(studentId);
}
```

## Configuration

No special configuration required. Standard NestJS module configuration applies.

## Error Handling

| Error Code          | Description                             |
| ------------------- | --------------------------------------- |
| `NOT_FOUND`         | Enrollment not found                    |
| `VALIDATION_ERROR`  | Invalid enrollment data                 |
| `STUDENT_NOT_FOUND` | Referenced student user does not exist  |
| `COURSE_NOT_FOUND`  | Referenced course does not exist        |
| `ALREADY_ENROLLED`  | Student already enrolled in this course |
| `NOT_STUDENT_ROLE`  | User does not have student role         |

## Notes

- All delete operations use soft deletes to preserve historical enrollment data
- The service validates student role via User Service
- The service validates course existence via Course Service
- Duplicate enrollments are prevented at the database level

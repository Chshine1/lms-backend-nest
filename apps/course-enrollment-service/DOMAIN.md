# Domain Model – Course Enrollment Service

## Overview

The Course Enrollment Service manages the relationship between students and courses. It acts as a join table that captures which students are enrolled in which courses. This service is fundamental to the LMS as it enables other services (like Assignment Service) to track student progress and submissions.

## Aggregates

### Enrollment (Root Aggregate)

The Enrollment is the root aggregate for this service. It represents the act of a student joining a course.

**Responsibilities:**

- Manage enrollment identity
- Track enrollment timestamp
- Maintain references to student and course
- Enforce business invariants

**Transactional Boundary:**

The aggregate boundary includes only the enrollment record itself. There are no child entities within this aggregate.

## Entities

### Enrollment

**Identity:** `id` (generated)

**Attributes:**

| Field      | Type   | Description                                 |
| ---------- | ------ | ------------------------------------------- |
| studentId  | number | Reference to User (student) in User Service |
| courseId   | number | Reference to Course in Course Service       |
| enrolledAt | Date   | Timestamp of enrollment creation            |

**Lifecycle:**

- Created when a student enrolls in a course
- Soft-deleted when a student unenrolls (preserves historical record)

**State Transitions:**

- Active → Soft Deleted (via unenrollment)

## Value Objects

### StudentReference

Lightweight reference to a student from User Service.

**Attributes:**

- `studentId`: number (User Service user ID)

### CourseReference

Lightweight reference to a course from Course Service.

**Attributes:**

- `courseId`: number (Course Service course ID)

## Domain Events

| Event Name           | Trigger                    | Data Payload                            |
| -------------------- | -------------------------- | --------------------------------------- |
| `enrollment.created` | Student enrolled in course | `{ enrollmentId, studentId, courseId }` |
| `enrollment.deleted` | Student unenrolled         | `{ enrollmentId, studentId, courseId }` |

## Business Invariants

1. **Student Role Validation**: A `studentId` must reference a valid user with the `student` role in the User Service.
2. **Course Existence**: A `courseId` must reference a valid course in the Course Service.
3. **No Duplicate Enrollment**: A student cannot be enrolled in the same course more than once.
4. **Valid Student Reference**: The student must exist and be active in the system.

## Domain Services

### EnrollmentValidationService

**Responsibilities:**

- Validate student role
- Check for duplicate enrollments
- Verify course existence

**Operations:**

- `validateStudentRole(studentId: number): Promise<boolean>`
- `checkDuplicateEnrollment(studentId: number, courseId: number): Promise<boolean>`

### EnrollmentQueryService

**Responsibilities:**

- Query enrollments by various criteria

**Operations:**

- `findByCourse(courseId: number): Promise<Enrollment[]>`
- `findByStudent(studentId: number): Promise<Enrollment[]>`
- `findByStudentAndCourse(studentId: number, courseId: number): Promise<Enrollment | null>`

## Relationships

```
User (student) ──────< (N) Enrollment ──────> Course (external)
```

The Enrollment acts as a many-to-many join table between User (student role) and Course. Both references are external, managed by their respective services.

## Notes

- The service does not track enrollment status beyond active/soft-deleted
- Course capacity limits are not enforced by this service (could be added as future enhancement)
- Enrollment history is preserved through soft deletes
- The service does not handle waitlisting or enrollment requests; these would be future enhancements

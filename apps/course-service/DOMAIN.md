## Domain Model

### 1. Aggregates and Entities

#### 1.1 Course Aggregate

**Core Responsibility**: Manages the lifecycle and structure of a course catalog entry. It ensures the consistency of the course metadata and its nested `CourseUnit` collection. It **does not** manage student enrollment status (handled by the separate `Enrollment` aggregate) nor does it manage assignment content (owned by `assessment-service`).

| Member Type        | Member Name      | PostgreSQL Type | Description / Domain Behavior                                                                                                                                          | Domain Constraints / Rules               |
| :----------------- | :--------------- | :-------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :--------------------------------------- |
| **Aggregate Root** | **Course**       | -               | Represents a specific offering or subject area. (PRD Mapping: Courses entity)                                                                                          | -                                        |
| Field              | `id`             | `BIGINT`        | Unique internal identifier for the course.                                                                                                                             | `PRIMARY KEY`, `NOT NULL`, Immutable     |
| Field              | `name`           | `VARCHAR(255)`  | Public display name of the course. (PRD Mapping: Course Name)                                                                                                          | `NOT NULL`                               |
| Field              | `code`           | `VARCHAR(50)`   | Formal course catalog code (e.g., "CS101"). (PRD Mapping: Course Code)                                                                                                 | `UNIQUE`, `NOT NULL`                     |
| Field              | `description`    | `TEXT`          | Markdown content describing the course overview. (PRD Mapping: Course Description)                                                                                     | `NOT NULL`, Default `''`                 |
| Field              | `teachers`       | `BIGINT[]`      | **Modeled as a collection of External References.** Array of user IDs sourced from `user-service`. (PRD Mapping: Teachers represented by array of bigint ids)          | `NOT NULL`, Default `'{}'`               |
| **Entity Method**  | `addUnit`        | -               | Adds a new `CourseUnit` to the course. Validates that unit names are unique within the course. (PRD Mapping: One course with many course units)                        | Throws `DuplicateUnitNameException`      |
| **Entity Method**  | `updateMetadata` | -               | Updates the `name`, `code`, or `description`. Re-validates code uniqueness before persistence. (PRD Mapping: Course fields)                                            | Throws `InvalidCourseStateException`     |
| **Entity Method**  | `assignTeacher`  | -               | Adds a teacher ID to the `teachers` array. **Note: Validation of whether the ID is a valid Teacher role is delegated to a Domain Service before calling this method.** | Publishes `TeacherAssignedToCourseEvent` |

---

#### 1.2 Enrollment (Relationship Aggregate)

**Core Responsibility**: Persists the act of a student joining a course. It represents the explicit link between a `User` (in external service) and a `Course`. **Business rule validation (e.g., "Can student enroll?") is performed by `EnrollmentDomainService`, not inside this entity.**

| Member Type | Member Name    | PostgreSQL Type | Description                                                                                          | Domain Constraints / Rules                                       |
| :---------- | :------------- | :-------------- | :--------------------------------------------------------------------------------------------------- | :--------------------------------------------------------------- |
| Entity      | **Enrollment** | -               | Represents a student's active participation in a course. (PRD Mapping: Student enrollments)          | -                                                                |
| Field       | `id`           | `BIGINT`        | Unique identifier for the enrollment record.                                                         | `PRIMARY KEY`                                                    |
| Field       | `studentId`    | `BIGINT`        | References the student's user ID in `user-service`.                                                  | `NOT NULL`. Part of `UNIQUE(studentId, courseId)`                |
| Field       | `courseId`     | `BIGINT`        | References `Course.id`.                                                                              | `FOREIGN KEY`, `NOT NULL`. Part of `UNIQUE(studentId, courseId)` |
| Field       | `enrolledAt`   | `TIMESTAMPTZ`   | Timestamp when the enrollment was created.                                                           | `NOT NULL`, Immutable                                            |
| Field       | `status`       | `VARCHAR(20)`   | Status of enrollment (`ACTIVE`, `COMPLETED`, `DROPPED`). (PRD Mapping: Enrollment entity equivalent) | `NOT NULL`, Default `'ACTIVE'`                                   |

---

### 2. Value Objects (Domain Primitives)

| Value Object     | Internal Representation      | Invariants / Validation                                                                                              | Behavior           |
| :--------------- | :--------------------------- | :------------------------------------------------------------------------------------------------------------------- | :----------------- |
| `CourseUnit`     | `String`, `String`           | **name**: Length 1-100 characters. **description**: Max 5000 characters. (PRD Mapping: Course unit name/description) | `updateContent()`  |
| `AttachmentFile` | `String`, `String`, `BigInt` | **fileKey**: S3/MinIO object key format. **fileName**: Safe filename regex. **sizeBytes**: Positive integer.         | `getDownloadUrl()` |

---

### 3. Application Layer (Orchestration)

| Application Service              | Method                | Input                                     | Output      | Dependencies / Notes                                                                                                                                                                                 |
| :------------------------------- | :-------------------- | :---------------------------------------- | :---------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **CourseApplicationService**     | `createCourse`        | `CreateCourseDto`, `CreatorUserId`        | `CourseDto` | Uses `CourseRepository`. Validates `code` uniqueness. Publishes `CourseCreatedEvent`. (PRD Mapping: Create Course)                                                                                   |
| **CourseApplicationService**     | `addAttachmentToUnit` | `courseId`, `unitId`, `FileDto`           | `UnitDto`   | Uses `CourseRepository`, `StorageService`. Loads Course aggregate, calls `course.addAttachmentToUnit()`, saves. (PRD Mapping: Attachments for each unit)                                             |
| **EnrollmentApplicationService** | `enrollStudent`       | `courseId`, `studentId`, `EnrollerUserId` | `void`      | Uses `EnrollmentDomainService`, `EnrollmentRepository`. Checks authorization (self-enroll vs teacher-enroll). Saves Enrollment. Publishes `StudentEnrolledEvent`. (PRD Mapping: Student enrollments) |

---

### 4. Domain Services (Encapsulated Business Rules)

| Domain Service              | Method   | Responsibility                                                                                                                                                                                                   | Dependencies                                            |
| :-------------------------- | :------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :------------------------------------------------------ |
| **EnrollmentDomainService** | `enroll` | Enforces the rule: _A student may only be enrolled once per course._ Checks for existing active enrollment. Also verifies (via an anti-corruption layer) that the course is not archived and the student exists. | `EnrollmentRepository`, `UserServiceClient` (Interface) |

---

### 5. Domain Events

| Event Name                       | Payload Data                             | Triggering Point                                                                                                         |
| :------------------------------- | :--------------------------------------- | :----------------------------------------------------------------------------------------------------------------------- |
| **CourseCreatedEvent**           | `courseId`, `name`, `code`, `teacherIds` | `CourseApplicationService.createCourse` after persistence. (PRD Mapping: Course creation notification)                   |
| **StudentEnrolledEvent**         | `enrollmentId`, `studentId`, `courseId`  | `EnrollmentApplicationService.enrollStudent` after persistence. (PRD Mapping: Enrollment triggers access to assessments) |
| **TeacherAssignedToCourseEvent** | `courseId`, `teacherId`                  | `Course.assignTeacher` (via Application Service orchestration). (PRD Mapping: Teacher permissions update)                |

---

### 6. Key Business Rules & Invariants

| Rule ID   | Description                                                   | Enforcement Location                                                              |
| :-------- | :------------------------------------------------------------ | :-------------------------------------------------------------------------------- |
| **BR-01** | Course code must be unique across the system.                 | Database `UNIQUE` constraint & Application Service pre-check.                     |
| **BR-02** | A student cannot be enrolled in the same course twice.        | Database `UNIQUE(studentId, courseId)` constraint on `Enrollment`.                |
| **BR-03** | Only teachers linked to the course (or admins) can add units. | `CourseApplicationService` (Authorization check before calling Aggregate method). |

---

### 7. Repository Interfaces (Conceptual)

```typescript
interface CourseRepository {
  save(course: Course): Promise<void>;
  findById(id: bigint): Promise<Course | null>;
  findByCode(code: string): Promise<Course | null>;
}

interface EnrollmentRepository {
  save(enrollment: Enrollment): Promise<void>;
  findByStudentAndCourse(
    studentId: bigint,
    courseId: bigint,
  ): Promise<Enrollment | null>;
  findActiveByStudent(studentId: bigint): Promise<Enrollment[]>;
}
```

---

### 8. Microservice Integration Note

- **`User`** data resides in a separate `user-service`.
- This service publishes `StudentEnrolledEvent` to a message broker (e.g., Kafka/RabbitMQ).
- **`assessment-service`** subscribes to `StudentEnrolledEvent` and creates a local read-model (or permission record) so it can answer the question: "Is Student X allowed to view/submit to Assignment Y?" without calling the `course-service` synchronously.

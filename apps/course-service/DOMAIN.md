_# Domain Model – Course Service

## Overview

The Course Service manages the static content structure of courses within the LMS. It handles course metadata,
organizational structure (sections/weeks), teaching assignments, course materials, and assignments. This service
does not deal with student enrollment, assignment submissions, or grading.

## Aggregates

### Course (Root Aggregate)

The Course is the root aggregate that encompasses all course-related content. It serves as the consistency boundary
for course metadata, teachers, sections, and assignments.

**Responsibilities:**

- Manage course identity (id, code, semester)
- Manage course metadata (name, description)
- Manage teacher associations
- Manage course sections
- Enforce business invariants within the course boundary

## Entities

### Course

**Identity:** `id` (generated), `code` (unique per semester), `semester`

**Attributes:**

| Field       | Type      | Description                             |
|-------------|-----------|-----------------------------------------|
| code        | string    | Unique course code (e.g., "CS101")      |
| semester    | string    | Academic semester (e.g., "2024-Spring") |
| name        | string    | Course name                             |
| description | string    | Course description                      |
| teachers    | Teacher[] | References to user-service teachers     |

**Lifecycle:**

- Created via course creation workflow
- Updated to modify metadata or structure
- Soft-deleted (archived) rather than hard-deleted

**Invariants:**

- Course code must be unique within a semester
- At least one teacher must be assigned
- Semester must follow valid format (e.g., YYYY-Term)

### CourseSection

Represents a logical division within a course (commonly "weeks" or modules). Renamed from "Week" to better reflect
that these are content sections rather than time-based scheduling units.

**Identity:** `id`, `index` (ordered position within course)

**Attributes:**

| Field       | Type   | Description                 |
|-------------|--------|-----------------------------|
| courseId    | number | Reference to parent course  |
| title       | string | Section title               |
| description | string | Section description         |
| index       | number | Position order (1, 2, 3...) |

**Lifecycle:**

- Created as part of course structure definition
- Reorderable via index modification

**Invariants:**

- Index must be positive and sequential within a course
- Section must belong to a valid course

### Assignment

Represents a task or exercise within a course section.

**Identity:** `id`

**Attributes:**

| Field       | Type   | Description                 |
|-------------|--------|-----------------------------|
| sectionId   | number | Reference to parent section |
| title       | string | Assignment title            |
| description | string | Assignment instructions     |

**Lifecycle:**

- Created within a section
- Can be modified or removed before course publication

**Invariants:**

- Must belong to a valid section
- Title cannot be empty

## Value Objects

### CourseCode

Encapsulates the course code value with validation rules.

**Attributes:**

- `value`: string (e.g., "CS101")

**Validation:**

- Must follow pattern: uppercase letters + numbers (e.g., `^[A-Z]{2,4}[0-9]{3}$`)
- Must be unique within semester scope

### Semester

Encapsulates the academic semester value.

**Attributes:**

- `year`: number (e.g., 2024)
- `term`: string (e.g., "Spring", "Fall", "Summer")

**Validation:**

- Term must be one of: Spring, Summer, Fall, Winter

### TeacherReference

Lightweight reference to a teacher from user-service.

**Attributes:**

- `teacherId`: string (user-service user ID)
- `role`: string (e.g., "instructor", "ta")

## Domain Events

| Event Name                 | Trigger                       | Data Payload                            |
|----------------------------|-------------------------------|-----------------------------------------|
| `course.created`           | Course entity created         | `{ courseId, code, semester, name }`    |
| `course.updated`           | Course metadata changed       | `{ courseId, changes }`                 |
| `course.teacher.added`     | Teacher assigned to course    | `{ courseId, teacherId }`               |
| `course.section.created`   | New section added to course   | `{ sectionId, courseId, index, title }` |
| `course.section.reordered` | Section order changed         | `{ courseId, sectionId, newIndex }`     |
| `assignment.created`       | Assignment created in section | `{ assignmentId, sectionId, title }`    |

## Business Invariants

1. **Course Code Uniqueness**: A course code must be unique within an academic semester.
2. **Teacher Assignment**: Every course must have at least one teacher.
3. **Section Order**: Sections within a course must have sequential indices starting from 1.
4. **Section-Course Binding**: A section cannot exist without a parent course.
5. **Assignment-Section Binding**: An assignment cannot exist without a parent section.
6. **Valid Semester Format**: Semester must follow `YYYY-Term` format.

## Domain Services

### CourseManagementService

**Responsibilities:**

- Create new courses with validation
- Update course metadata
- Manage teacher assignments

**Operations:**

- `createCourse(dto: CreateCourseDto): Promise<Course>`
- `updateCourse(id: number, dto: UpdateCourseDto): Promise<Course>`
- `assignTeacher(courseId: number, teacherId: string): Promise<void>`
- `removeTeacher(courseId: number, teacherId: string): Promise<void>`

### SectionManagementService

**Responsibilities:**

- Create, update, delete course sections
- Manage section ordering

**Operations:**

- `createSection(courseId: number, dto: CreateSectionDto): Promise<CourseSection>`
- `updateSection(id: number, dto: UpdateSectionDto): Promise<CourseSection>`
- `reorderSections(courseId: number, sectionIds: number[]): Promise<void>`
- `deleteSection(id: number): Promise<void>`

### AssignmentManagementService

**Responsibilities:**

- Create, update, delete assignments within sections

**Operations:**

- `createAssignment(sectionId: number, dto: CreateAssignmentDto): Promise<Assignment>`
- `updateAssignment(id: number, dto: UpdateAssignmentDto): Promise<Assignment>`
- `deleteAssignment(id: number): Promise<void>`

### MaterialService

**Responsibilities:**

- Manage materials for sections and assignments
- Interface with file service for storage

**Operations:**

- `uploadMaterial(sectionId: number, file: File): Promise<Material>`
- `attachMaterialToAssignment(assignmentId: number, materialId: number): Promise<void>`
- `removeMaterial(id: number): Promise<void>`

## Relationships

```
Course (1) ──────< (N) CourseSection
Course (1) ──────< (N) TeacherReference
CourseSection (1) ──────< (N) Assignment
CourseSection (1) ──────< (N) Material
Assignment (1) ──────< (N) Material
```

## Notes

- Teacher references use string IDs that correspond to user-service user entities
- Materials may be attached to both sections and assignments (polymorphic relationship)
- This service does not handle file storage directly; it communicates with a file service (see PLAN.md)
- All delete operations are soft deletes to preserve historical data_

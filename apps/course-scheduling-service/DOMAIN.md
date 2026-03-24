# Domain Model – Course Scheduling Service

## Overview

The Course Scheduling Service manages the logistical details of when and where a course meets. It maintains the operational schedule separately from the course's academic content to ensure clean separation of concerns. This service is responsible for creating and managing schedule entries that define the time and location for course sessions.

## Aggregates

### CourseSchedule (Root Aggregate)

The CourseSchedule is the root aggregate for this service. It represents a single scheduled session for a course, such as a weekly lecture or lab session.

**Responsibilities:**

- Manage schedule identity
- Validate time consistency (end time after start time)
- Store location information
- Maintain reference to the parent course

**Transactional Boundary:**

The aggregate boundary includes only the schedule entry itself. There are no child entities within this aggregate.

## Entities

### CourseSchedule

**Identity:** `id` (generated)

**Attributes:**

| Field     | Type      | Description                           |
| --------- | --------- | ------------------------------------- |
| courseId  | number    | Reference to Course in Course Service |
| dayOfWeek | DayOfWeek | Day of the week (MONDAY-SUNDAY)       |
| startTime | string    | Start time in "HH:mm" format          |
| endTime   | string    | End time in "HH:mm" format            |
| location  | string    | Physical or virtual location          |

**Lifecycle:**

- Created when a schedule is added to a course
- Updated when time or location changes
- Deleted when schedule is removed

**State Transitions:**

- Created → Updated → Deleted (simple lifecycle)

## Value Objects

### TimeSlot

Represents a time range with start and end times.

**Attributes:**

- `startTime`: string ("HH:mm")
- `endTime`: string ("HH:mm")

**Validation:**

- End time must be after start time
- Times must be valid 24-hour format

### Location

Represents where a course session takes place.

**Attributes:**

- `value`: string

**Examples:**

- "Room 101" (physical classroom)
- "Building A, Floor 2" (campus location)
- "https://zoom.us/j/123456789" (virtual meeting)

## Domain Events

| Event Name         | Trigger                    | Data Payload                                    |
| ------------------ | -------------------------- | ----------------------------------------------- |
| `schedule.created` | New schedule entry created | `{ scheduleId, courseId, dayOfWeek, location }` |
| `schedule.updated` | Schedule details changed   | `{ scheduleId, changes }`                       |
| `schedule.deleted` | Schedule entry removed     | `{ scheduleId, courseId }`                      |

## Business Invariants

1. **Course Reference Validity**: A `courseId` must reference a valid course that exists in the Course Service.
2. **Time Consistency**: A `CourseSchedule` cannot have an `endTime` that is before its `startTime`.
3. **Valid Day of Week**: `dayOfWeek` must be a valid value from the DayOfWeek enum.
4. **Valid Time Format**: Times must be in valid "HH:mm" 24-hour format.
5. **Non-Empty Location**: Location cannot be empty or null.

## Domain Services

### ScheduleValidationService

**Responsibilities:**

- Validate time consistency
- Check for schedule overlaps (if required by business rules)

**Operations:**

- `validateTimeRange(startTime: string, endTime: string): boolean`
- `checkOverlap(schedule1: CourseSchedule, schedule2: CourseSchedule): boolean`

### ScheduleQueryService

**Responsibilities:**

- Retrieve schedules by various criteria
- Filter and sort schedule data

**Operations:**

- `findByCourse(courseId: number): Promise<CourseSchedule[]>`
- `findByDayOfWeek(courseId: number, dayOfWeek: DayOfWeek): Promise<CourseSchedule[]>`

## Relationships

```
Course (external) ──────< (N) CourseSchedule
```

The CourseSchedule references Course from the Course Service, but does not own or manage it. The relationship is maintained through the `courseId` foreign key.

## Notes

- Schedule overlap detection is currently not enforced at the database level; business logic should handle this if required
- This service does not integrate with calendar systems; such integration would be handled at a higher layer (BFF or API gateway)
- Time zones are not currently handled; all times are assumed to be in the same time zone as the server

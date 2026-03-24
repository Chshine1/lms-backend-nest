# Course Scheduling Service – Public API

## Purpose

Manages course schedules, handling the when and where of course sessions. Provides APIs for creating, retrieving, updating, and deleting schedule entries.

## Exported Services

### CourseSchedulingService

The main service exposed by this module for managing course schedules.

**Methods:**

| Method                 | Parameters                                         | Return Type                 | Description                    |
| ---------------------- | -------------------------------------------------- | --------------------------- | ------------------------------ |
| `createSchedule`       | `createScheduleDto: CreateScheduleDto`             | `Promise<CourseSchedule>`   | Create a new schedule entry    |
| `getSchedulesByCourse` | `courseId: number`                                 | `Promise<CourseSchedule[]>` | Get all schedules for a course |
| `getScheduleById`      | `id: number`                                       | `Promise<CourseSchedule>`   | Get a specific schedule        |
| `updateSchedule`       | `id: number, updateScheduleDto: UpdateScheduleDto` | `Promise<CourseSchedule>`   | Update a schedule entry        |
| `deleteSchedule`       | `id: number`                                       | `Promise<void>`             | Delete a schedule entry        |

## Exported Types

### DayOfWeek (Enum)

```typescript
enum DayOfWeek {
  MONDAY = 'MONDAY',
  TUESDAY = 'TUESDAY',
  WEDNESDAY = 'WEDNESDAY',
  THURSDAY = 'THURSDAY',
  FRIDAY = 'FRIDAY',
  SATURDAY = 'SATURDAY',
  SUNDAY = 'SUNDAY',
}
```

### CreateScheduleDto

```typescript
class CreateScheduleDto {
  @IsDefined()
  @IsNumber()
  courseId!: number;

  @IsEnum(DayOfWeek)
  dayOfWeek!: DayOfWeek;

  @IsDefined()
  @IsString()
  startTime!: string; // Format: "HH:mm"

  @IsDefined()
  @IsString()
  endTime!: string; // Format: "HH:mm"

  @IsDefined()
  @IsString()
  location!: string;
}
```

### UpdateScheduleDto

```typescript
class UpdateScheduleDto {
  @IsEnum(DayOfWeek)
  dayOfWeek?: DayOfWeek;

  @IsString()
  startTime?: string;

  @IsString()
  endTime?: string;

  @IsString()
  location?: string;
}
```

### CourseSchedule (Entity)

```typescript
class CourseSchedule {
  id!: number;
  courseId!: number;
  dayOfWeek!: DayOfWeek;
  startTime!: string;
  endTime!: string;
  location!: string;
  createdAt!: Date;
  updatedAt!: Date;
}
```

## Usage Example

```typescript
import { Module } from '@nestjs/common';
import { CourseSchedulingModule } from '@app/course-scheduling';

@Module({
  imports: [CourseSchedulingModule],
  controllers: [SomeController],
})
export class SomeModule {}
```

```typescript
constructor(
  private readonly schedulingService: CourseSchedulingService,
) {}

async createSchedule() {
  const schedule = await this.schedulingService.createSchedule({
    courseId: 1,
    dayOfWeek: DayOfWeek.MONDAY,
    startTime: '09:00',
    endTime: '10:30',
    location: 'Room 101',
  });
}
```

## Configuration

No special configuration required. Standard NestJS module configuration applies.

## Error Handling

| Error Code         | Description                      |
| ------------------ | -------------------------------- |
| `NOT_FOUND`        | Schedule entry not found         |
| `VALIDATION_ERROR` | Invalid schedule data            |
| `COURSE_NOT_FOUND` | Referenced course does not exist |

## Notes

- Time values are stored as strings in "HH:mm" format
- The service does not validate overlapping schedules within the same course; this should be handled by the caller or a domain service if required
- All timestamps are managed by TypeORM automatically

import { DomainEvent } from '@app/event-bus';

export class CourseCreatedEvent implements DomainEvent {
  readonly eventId: string;
  readonly occurredAt: Date;
  readonly eventType = 'CourseCreatedEvent';

  constructor(
    public readonly courseId: bigint,
    public readonly name: string,
    public readonly code: string,
    public readonly teacherIds: bigint[],
    occurredAt?: Date,
  ) {
    this.eventId = crypto.randomUUID();
    this.occurredAt = occurredAt ?? new Date();
  }
}

export class StudentEnrolledEvent implements DomainEvent {
  readonly eventId: string;
  readonly occurredAt: Date;
  readonly eventType = 'StudentEnrolledEvent';

  constructor(
    public readonly enrollmentId: bigint,
    public readonly studentId: bigint,
    public readonly courseId: bigint,
    occurredAt?: Date,
  ) {
    this.eventId = crypto.randomUUID();
    this.occurredAt = occurredAt ?? new Date();
  }
}

export class TeacherAssignedToCourseEvent implements DomainEvent {
  readonly eventId: string;
  readonly occurredAt: Date;
  readonly eventType = 'TeacherAssignedToCourseEvent';

  constructor(
    public readonly courseId: bigint,
    public readonly teacherId: bigint,
    occurredAt?: Date,
  ) {
    this.eventId = crypto.randomUUID();
    this.occurredAt = occurredAt ?? new Date();
  }
}

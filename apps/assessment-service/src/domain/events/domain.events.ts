import { DomainEvent } from '@app/event-bus';

export class SubmissionCreatedEvent implements DomainEvent {
  readonly eventId: string;
  readonly occurredAt: Date;
  readonly eventType = 'SubmissionCreatedEvent';

  constructor(
    public readonly submissionId: bigint,
    public readonly studentId: bigint,
    public readonly assignmentId: bigint,
    occurredAt?: Date,
  ) {
    this.eventId = crypto.randomUUID();
    this.occurredAt = occurredAt ?? new Date();
  }
}

export class SubmissionGradedEvent implements DomainEvent {
  readonly eventId: string;
  readonly occurredAt: Date;
  readonly eventType = 'SubmissionGradedEvent';

  constructor(
    public readonly submissionId: bigint,
    public readonly studentId: bigint,
    public readonly grade: number,
    occurredAt?: Date,
  ) {
    this.eventId = crypto.randomUUID();
    this.occurredAt = occurredAt ?? new Date();
  }
}

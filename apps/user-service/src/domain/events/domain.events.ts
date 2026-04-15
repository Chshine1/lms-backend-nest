import { DomainEvent } from '@app/event-bus';

export class AccountCreated implements DomainEvent {
  readonly eventId: string;
  readonly occurredAt: Date;
  readonly eventType = 'AccountCreated';

  constructor(
    public readonly userId: bigint,
    public readonly email: string,
    public readonly tenantId: bigint,
    public readonly createdAt: Date,
  ) {
    this.eventId = crypto.randomUUID();
    this.occurredAt = createdAt;
  }
}

export class EmailVerificationRequested implements DomainEvent {
  readonly eventId: string;
  readonly occurredAt: Date;
  readonly eventType = 'EmailVerificationRequested';

  constructor(
    public readonly userId: bigint,
    public readonly email: string,
    public readonly expiresAt: Date,
  ) {
    this.eventId = crypto.randomUUID();
    this.occurredAt = new Date();
  }
}

export class EmailVerified implements DomainEvent {
  readonly eventId: string;
  readonly occurredAt: Date;
  readonly eventType = 'EmailVerified';

  constructor(
    public readonly userId: bigint,
    public readonly verifiedAt: Date,
  ) {
    this.eventId = crypto.randomUUID();
    this.occurredAt = verifiedAt;
  }
}

export class StudentOnboardingCompleted implements DomainEvent {
  readonly eventId: string;
  readonly occurredAt: Date;
  readonly eventType = 'StudentOnboardingCompleted';

  constructor(
    public readonly studentUserId: bigint,
    public readonly completedAt: Date,
  ) {
    this.eventId = crypto.randomUUID();
    this.occurredAt = completedAt;
  }
}

export class ParentLinkedToStudent implements DomainEvent {
  readonly eventId: string;
  readonly occurredAt: Date;
  readonly eventType = 'ParentLinkedToStudent';

  constructor(
    public readonly parentUserId: bigint,
    public readonly studentUserId: bigint,
    public readonly linkedAt: Date,
  ) {
    this.eventId = crypto.randomUUID();
    this.occurredAt = linkedAt;
  }
}

export class RoleAssignedToUser implements DomainEvent {
  readonly eventId: string;
  readonly occurredAt: Date;
  readonly eventType = 'RoleAssignedToUser';

  constructor(
    public readonly userId: bigint,
    public readonly roleId: bigint,
    public readonly assignedBy: bigint,
  ) {
    this.eventId = crypto.randomUUID();
    this.occurredAt = new Date();
  }
}

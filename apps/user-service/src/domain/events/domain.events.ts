export class AccountCreated {
  constructor(
    public readonly userId: bigint,
    public readonly email: string,
    public readonly tenantId: bigint,
    public readonly createdAt: Date,
  ) {}
}

export class EmailVerificationRequested {
  constructor(
    public readonly userId: bigint,
    public readonly email: string,
    public readonly expiresAt: Date,
  ) {}
}

export class EmailVerified {
  constructor(
    public readonly userId: bigint,
    public readonly verifiedAt: Date,
  ) {}
}

export class StudentOnboardingCompleted {
  constructor(
    public readonly studentUserId: bigint,
    public readonly completedAt: Date,
  ) {}
}

export class ParentLinkedToStudent {
  constructor(
    public readonly parentUserId: bigint,
    public readonly studentUserId: bigint,
    public readonly linkedAt: Date,
  ) {}
}

export class RoleAssignedToUser {
  constructor(
    public readonly userId: bigint,
    public readonly roleId: bigint,
    public readonly assignedBy: bigint,
  ) {}
}

export type DomainEvent =
  | AccountCreated
  | EmailVerificationRequested
  | EmailVerified
  | StudentOnboardingCompleted
  | ParentLinkedToStudent
  | RoleAssignedToUser;

export class AccountCreated {
  constructor(
    public readonly userId: number,
    public readonly email: string,
    public readonly tenantId: number,
    public readonly createdAt: Date,
  ) {}
}

export class EmailVerificationRequested {
  constructor(
    public readonly userId: number,
    public readonly email: string,
    public readonly expiresAt: Date,
  ) {}
}

export class EmailVerified {
  constructor(
    public readonly userId: number,
    public readonly verifiedAt: Date,
  ) {}
}

export class StudentOnboardingCompleted {
  constructor(
    public readonly studentUserId: number,
    public readonly completedAt: Date,
  ) {}
}

export class ParentLinkedToStudent {
  constructor(
    public readonly parentUserId: number,
    public readonly studentUserId: number,
    public readonly linkedAt: Date,
  ) {}
}

export class RoleAssignedToUser {
  constructor(
    public readonly userId: number,
    public readonly roleId: number,
    public readonly assignedBy: number,
  ) {}
}

export type DomainEvent =
  | AccountCreated
  | EmailVerificationRequested
  | EmailVerified
  | StudentOnboardingCompleted
  | ParentLinkedToStudent
  | RoleAssignedToUser;

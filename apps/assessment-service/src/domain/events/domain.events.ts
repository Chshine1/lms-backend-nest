export class SubmissionCreatedEvent {
  constructor(
    public readonly submissionId: bigint,
    public readonly studentId: bigint,
    public readonly assignmentId: bigint,
  ) {}
}

export class SubmissionGradedEvent {
  constructor(
    public readonly submissionId: bigint,
    public readonly studentId: bigint,
    public readonly grade: number,
  ) {}
}

export class SubmissionDataDto {
  content!: string;
}

export class SubmissionDto {
  id!: bigint;
  studentId!: bigint;
  assignmentId!: bigint;
  content!: string;
  submissionCount!: number;
  submittedAt!: Date;
}

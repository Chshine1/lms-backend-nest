export class SubmissionDataDto {
  content!: string;
  files!: { fileKey: string; fileName: string }[];
}

export class SubmissionDto {
  id!: bigint;
  studentId!: bigint;
  assignmentId!: bigint;
  content!: string;
  submissionCount!: number;
  submittedAt!: Date;
}

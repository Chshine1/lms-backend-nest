export class GradeDto {
  grade!: number;
  comment!: string;
}

export class ReviewDto {
  id!: bigint;
  submissionId!: bigint;
  reviewerId!: bigint;
  grade!: number;
  comment!: string;
  reviewedAt!: Date;
}

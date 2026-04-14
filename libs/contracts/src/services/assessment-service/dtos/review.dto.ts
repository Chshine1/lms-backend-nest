import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

export const GradeSchema = z.object({
  grade: z.number(),
  comment: z.string(),
});

export class GradeDto extends createZodDto(GradeSchema) {}

export const ReviewSchema = z.object({
  id: z.bigint(),
  submissionId: z.bigint(),
  reviewerId: z.bigint(),
  grade: z.number(),
  comment: z.string(),
  reviewedAt: z.date(),
});

export class ReviewDto extends createZodDto(ReviewSchema) {}

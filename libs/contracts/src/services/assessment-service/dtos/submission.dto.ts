import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

export const SubmissionDataSchema = z.object({
  content: z.string(),
});

export class SubmissionDataDto extends createZodDto(SubmissionDataSchema) {}

export const SubmissionSchema = z.object({
  id: z.bigint(),
  studentId: z.bigint(),
  assignmentId: z.bigint(),
  content: z.string(),
  submissionCount: z.number().int(),
  submittedAt: z.date(),
});

export class SubmissionDto extends createZodDto(SubmissionSchema) {}

import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

export const CompleteOnboardingSchema = z.object({
  studentUserId: z.bigint(),
  signatureData: z.record(z.unknown()).optional(),
});

export class CompleteOnboardingDto extends createZodDto(
  CompleteOnboardingSchema,
) {}

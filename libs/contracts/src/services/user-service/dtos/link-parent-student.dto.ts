import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

export const LinkParentStudentSchema = z.object({
  parentUserId: z.bigint(),
  studentUserId: z.bigint(),
});

export class LinkParentStudentDto extends createZodDto(
  LinkParentStudentSchema,
) {}

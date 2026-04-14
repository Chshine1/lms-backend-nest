import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

export const CreateCourseSchema = z.object({
  name: z.string().min(1),
  code: z.string().min(1),
  description: z.string(),
  teacherIds: z.array(z.bigint()),
});

export class CreateCourseDto extends createZodDto(CreateCourseSchema) {}

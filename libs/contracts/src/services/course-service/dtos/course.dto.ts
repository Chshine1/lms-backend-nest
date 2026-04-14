import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

export const CourseSchema = z.object({
  id: z.bigint(),
  name: z.string(),
  code: z.string(),
  description: z.string(),
  teachers: z.array(z.bigint()),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export class CourseDto extends createZodDto(CourseSchema) {}

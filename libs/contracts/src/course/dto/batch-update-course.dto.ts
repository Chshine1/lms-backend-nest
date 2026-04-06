import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

const AssignmentCreateSchema = z.object({
  mode: z.literal('create'),
  title: z.string().min(1),
  description: z.string().min(1),
  dueDate: z.coerce.date(),
});

export type AssignmentBatchCreatePayload = z.infer<
  typeof AssignmentCreateSchema
>;

const AssignmentUpdateSchema = z.object({
  mode: z.literal('update'),
  id: z.number().int().positive(),
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  dueDate: z.coerce.date().optional(),
});

export type AssignmentBatchUpdatePayload = z.infer<
  typeof AssignmentUpdateSchema
>;

const AssignmentBatchSchema = z.object({
  payload: z.discriminatedUnion('mode', [
    AssignmentCreateSchema,
    AssignmentUpdateSchema,
  ]),
});

export class AssignmentBatchDto extends createZodDto(AssignmentBatchSchema) {}

const CourseUnitCreateSchema = z.object({
  mode: z.literal('create'),
  title: z.string().min(1),
  description: z.string(),
  position: z.number().int().min(0),
  assignments: z.array(AssignmentBatchSchema).optional(),
});

export type CourseUnitBatchCreatePayload = z.infer<
  typeof CourseUnitCreateSchema
>;

const CourseUnitUpdateSchema = z.object({
  mode: z.literal('update'),
  id: z.number().int().positive(),
  title: z.string().optional(),
  description: z.string().optional(),
  position: z.number().int().min(0).optional(),
  assignments: z.array(AssignmentBatchSchema).optional(),
});

export type CourseUnitBatchUpdatePayload = z.infer<
  typeof CourseUnitUpdateSchema
>;

const CourseUnitBatchSchema = z.object({
  payload: z.discriminatedUnion('mode', [
    CourseUnitCreateSchema,
    CourseUnitUpdateSchema,
  ]),
});

export class CourseUnitBatchDto extends createZodDto(CourseUnitBatchSchema) {}

const BatchUpdateCourseSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  units: z.array(CourseUnitBatchSchema).optional(),
});

export class BatchUpdateCourseDto extends createZodDto(
  BatchUpdateCourseSchema,
) {}

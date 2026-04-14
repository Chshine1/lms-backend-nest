import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

export const AssignRoleSchema = z.object({
  targetUserId: z.bigint(),
  roleId: z.bigint(),
});

export class AssignRoleDto extends createZodDto(AssignRoleSchema) {}

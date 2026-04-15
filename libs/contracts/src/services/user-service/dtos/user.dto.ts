import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';
import { UserStatus } from '@/user-service/src/domain/enums/user-status.enum';

export const UserSchema = z.object({
  id: z.bigint(),
  tenantId: z.bigint(),
  email: z.email(),
  phoneNumber: z.string().optional(),
  status: z.enum(UserStatus),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export class UserDto extends createZodDto(UserSchema) {}

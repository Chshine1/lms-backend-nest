import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

export const RegisterUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  phoneNumber: z.string().optional(),
  invitationCode: z.string().optional(),
});

export class RegisterUserDto extends createZodDto(RegisterUserSchema) {}

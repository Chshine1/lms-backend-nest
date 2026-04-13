import { UserStatus } from '@/user-service/src/domain/enums/user-status.enum';

export class UserDto {
  id!: number;
  tenantId!: number;
  email!: string;
  phoneNumber?: string;
  status!: UserStatus;
  createdAt!: Date;
  updatedAt!: Date;
}

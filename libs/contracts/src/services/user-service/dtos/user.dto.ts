import { UserStatus } from '@/user-service/src/domain/enums/user-status.enum';

export class UserDto {
  id!: bigint;
  tenantId!: bigint;
  email!: string;
  phoneNumber!: string | undefined;
  status!: UserStatus;
  createdAt!: Date;
  updatedAt!: Date;
}

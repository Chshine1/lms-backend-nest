import { Expose } from 'class-transformer';
import { BaseEntityContract } from '@app/contracts/base-entity.contract';

export enum UserStatus {
  ACTIVE = 1,
  INACTIVE = 2,
  LOCKED = 3,
}

export enum IdentityType {
  STUDENT = 1,
  TEACHER = 2,
  PARENT = 3,
  ADMIN = 4,
}

export class UserContract extends BaseEntityContract {
  @Expose()
  tenantId!: number;

  @Expose()
  username!: string;

  @Expose()
  email!: string;

  @Expose()
  phone!: string;

  @Expose()
  status!: UserStatus;

  @Expose()
  identityType!: IdentityType;
}

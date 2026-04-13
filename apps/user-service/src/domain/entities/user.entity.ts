import { defineEntity, p } from '@mikro-orm/core';
import { UserStatus } from '../enums/user-status.enum';
import {
  AggregateRootSchema,
  EmailType,
  EmailVo,
  PasswordHashType,
  PasswordHashVo,
  PhoneNumberType,
  PhoneNumberVo,
} from '@app/contracts';
import { InvalidPhoneNumberError, WeakPasswordError } from '../errors/index';

const UserSchema = defineEntity({
  name: 'User',
  extends: AggregateRootSchema,
  tableName: 'users',
  properties: {
    tenantId: p.bigint(),
    email: p.type(EmailType).length(255).unique(),
    phoneNumber: p.type(PhoneNumberType).length(20).nullable().unique(),
    passwordHash: p.type(PasswordHashType).length(255),
    status: p.enum(() => UserStatus).nativeEnumName('user_status'),
  },
});

export class User extends UserSchema.class {
  declare phoneNumber: PhoneNumberVo | null;

  constructor(
    tenantId: bigint,
    email: EmailVo,
    hashedPassword: PasswordHashVo,
    phoneNumber?: PhoneNumberVo | null,
  ) {
    super();
    this.tenantId = tenantId;
    this.email = email;
    this.phoneNumber = phoneNumber ?? null;
    this.passwordHash = hashedPassword;
    this.status = UserStatus.INACTIVE;
  }

  updatePhoneNumber(phoneNumber: PhoneNumberVo): void {
    try {
      this.phoneNumber = phoneNumber;
    } catch {
      throw new InvalidPhoneNumberError(phoneNumber.value);
    }
  }

  updatePassword(newPasswordHash: PasswordHashVo): void {
    try {
      this.passwordHash = newPasswordHash;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      throw new WeakPasswordError(message);
    }
  }
}

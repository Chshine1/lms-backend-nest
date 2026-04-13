import { defineEntity, p } from '@mikro-orm/core';
import { Email } from '../value-objects/email.value-object';
import { PhoneNumber } from '../value-objects/phone-number.value-object';
import { PasswordHash } from '../value-objects/password-hash.value-object';
import { UserStatus } from '../enums/user-status.enum';
import { AggregateRootSchema } from '@app/contracts';
import { InvalidPhoneNumberError, WeakPasswordError } from '../errors/index';

const UserSchema = defineEntity({
  name: 'User',
  extends: AggregateRootSchema,
  tableName: 'users',
  properties: {
    tenantId: p.bigint(),
    email: p.string().length(255).unique(),
    phoneNumber: p.string().length(20).nullable().unique(),
    passwordHash: p.string().length(255),
    status: p.enum(() => UserStatus).nativeEnumName('user_status'),
  },
});

export class User extends UserSchema.class {
  constructor(
    tenantId: bigint,
    email: Email,
    hashedPassword: PasswordHash,
    phoneNumber?: PhoneNumber,
  ) {
    super();
    this.tenantId = tenantId;
    this.email = email.getValue();
    this.phoneNumber = phoneNumber?.getValue();
    this.passwordHash = hashedPassword.getValue();
    this.status = UserStatus.ACTIVE;
  }

  getEmail(): Email {
    return Email.create(this.email);
  }

  getPhoneNumber(): PhoneNumber | undefined {
    if (!this.phoneNumber) {
      return undefined;
    }
    return PhoneNumber.create(this.phoneNumber);
  }

  getPasswordHash(): PasswordHash {
    return PasswordHash.create(this.passwordHash);
  }

  updatePhoneNumber(phoneNumber: PhoneNumber): void {
    try {
      this.phoneNumber = phoneNumber.getValue();
    } catch {
      throw new InvalidPhoneNumberError(phoneNumber.getValue());
    }
  }

  updatePassword(newPasswordHash: PasswordHash): void {
    try {
      this.passwordHash = newPasswordHash.getValue();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      throw new WeakPasswordError(message);
    }
  }

  lock(): void {
    this.status = UserStatus.LOCKED;
  }

  activate(): void {
    this.status = UserStatus.ACTIVE;
  }

  deactivate(): void {
    this.status = UserStatus.INACTIVE;
  }
}

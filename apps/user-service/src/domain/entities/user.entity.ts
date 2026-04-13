import { Entity, Enum, Property } from '@mikro-orm/core';
import { BaseEntityV2 } from '../shared/base-entity-v2';
import { Email } from '../value-objects/email.value-object';
import { PhoneNumber } from '../value-objects/phone-number.value-object';
import { PasswordHash } from '../value-objects/password-hash.value-object';
import { UserStatus } from '../enums/user-status.enum';
import {
  InvalidPhoneNumberException,
  WeakPasswordException,
} from '../exceptions/domain.exceptions';

@Entity({ tableName: 'users' })
export class User extends BaseEntityV2 {
  @Property({ fieldName: 'tenant_id', type: 'bigint' })
  tenantId!: number;

  @Property({ fieldName: 'email', type: 'varchar', length: 255, unique: true })
  private emailValue!: string;

  @Property({
    fieldName: 'phone_number',
    type: 'varchar',
    length: 20,
    unique: true,
    nullable: true,
  })
  private phoneNumberValue?: string;

  @Property({ fieldName: 'hashed_password', type: 'varchar', length: 255 })
  private hashedPasswordValue!: string;

  @Enum({
    fieldName: 'status',
    items: () => UserStatus,
    type: 'varchar',
    length: 30,
  })
  status!: UserStatus;

  constructor(
    tenantId: number,
    email: Email,
    hashedPassword: PasswordHash,
    phoneNumber?: PhoneNumber,
  ) {
    super();
    this.tenantId = tenantId;
    this.emailValue = email.getValue();
    this.hashedPasswordValue = hashedPassword.getValue();
    this.phoneNumberValue = phoneNumber?.getValue();
    this.status = UserStatus.ACTIVE;
  }

  getEmail(): Email {
    return Email.create(this.emailValue);
  }

  getPhoneNumber(): PhoneNumber | undefined {
    if (!this.phoneNumberValue) {
      return undefined;
    }
    return PhoneNumber.create(this.phoneNumberValue);
  }

  getPasswordHash(): PasswordHash {
    return PasswordHash.create(this.hashedPasswordValue);
  }

  updatePhoneNumber(phoneNumber: PhoneNumber): void {
    try {
      this.phoneNumberValue = phoneNumber.getValue();
    } catch {
      throw new InvalidPhoneNumberException(phoneNumber.getValue());
    }
  }

  updatePassword(newPasswordHash: PasswordHash): void {
    try {
      this.hashedPasswordValue = newPasswordHash.getValue();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      throw new WeakPasswordException(message);
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

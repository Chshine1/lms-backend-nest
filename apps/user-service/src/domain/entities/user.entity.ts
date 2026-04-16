import { defineEntity, p } from '@mikro-orm/core';
import { UserStatus } from '../enums/user-status.enum';
import { AggregateRootSchema } from '@app/contracts';
import {
  EmailType,
  EmailVo,
  PasswordHashType,
  PasswordHashVo,
  PhoneNumberType,
  PhoneNumberVo,
} from '../value-objects/index';
import { InvalidPhoneNumberError, WeakPasswordError } from '../errors/index';
import { EmailVerified } from '../events/domain.events';
import type { DomainEvent } from '@app/event-bus';

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
    emailVerifiedAt: p.datetime().nullable(),
  },
});

export class User extends UserSchema.class {
  declare phoneNumber: PhoneNumberVo | null;
  declare emailVerifiedAt: Date | null;
  // Lazy-loaded relationships (empty by default per DOMAIN.md §12)
  // Use repository with { include: ['roles'] } to load - should be UserRoleLink[]
  declare roles?: unknown[];
  // Use repository with { include: ['linkedStudents'] } to load - should be ParentStudentLink[]
  declare linkedStudents?: unknown[];

  private _domainEvents: DomainEvent[] = [];

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
    this.status = UserStatus.ACTIVE;
    this.emailVerifiedAt = null;
  }

  markEmailVerified(): void {
    const now = new Date();
    Object.assign(this, { emailVerifiedAt: now });
    this.addEvent(new EmailVerified(this.id, now));
  }

  getDomainEvents(): DomainEvent[] {
    return [...this._domainEvents];
  }

  clearDomainEvents(): void {
    this._domainEvents = [];
  }

  protected addEvent(event: DomainEvent): void {
    this._domainEvents.push(event);
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

UserSchema.setClass(User);

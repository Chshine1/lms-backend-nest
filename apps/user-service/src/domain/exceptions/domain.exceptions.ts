import { BaseError } from '@app/contracts';

export class InvalidPhoneNumberException extends BaseError {
  constructor(phoneNumber: string) {
    super(
      'INVALID_PHONE_NUMBER',
      `Invalid phone number format: ${phoneNumber}`,
    );
  }
}

export class WeakPasswordException extends BaseError {
  constructor(reason: string) {
    super(
      'WEAK_PASSWORD',
      `Password does not meet complexity requirements: ${reason}`,
    );
  }
}

export class OnboardingAlreadyCompletedException extends BaseError {
  constructor(studentUserId: bigint) {
    super(
      'ONBOARDING_ALREADY_COMPLETED',
      `Onboarding already completed for student user ID: ${studentUserId}`,
    );
  }
}

export class InvalidInvitationCodeException extends BaseError {
  constructor() {
    super('INVALID_INVITATION_CODE', 'The provided invitation code is invalid');
  }
}

export class EmailAlreadyExistsException extends BaseError {
  constructor(email: string) {
    super('EMAIL_ALREADY_EXISTS', `Email already registered: ${email}`);
  }
}

export class PhoneNumberAlreadyExistsException extends BaseError {
  constructor(phoneNumber: string) {
    super(
      'PHONE_NUMBER_ALREADY_EXISTS',
      `Phone number already registered: ${phoneNumber}`,
    );
  }
}

export class UserNotFoundException extends BaseError {
  constructor(userId: number) {
    super('USER_NOT_FOUND', `User not found: ${userId}`);
  }
}

export class TenantNotFoundException extends BaseError {
  constructor(identifier: string | number) {
    super('TENANT_NOT_FOUND', `Tenant not found: ${identifier}`);
  }
}

export class InvalidRoleLinkingException extends BaseError {
  constructor(reason: string) {
    super('INVALID_ROLE_LINKING', reason);
  }
}

export class DifferentTenantException extends BaseError {
  constructor() {
    super('DIFFERENT_TENANT', 'Users must belong to the same tenant');
  }
}

export class UnauthorizedActionException extends BaseError {
  constructor(action: string) {
    super('UNAUTHORIZED_ACTION', `Unauthorized to perform action: ${action}`);
  }
}

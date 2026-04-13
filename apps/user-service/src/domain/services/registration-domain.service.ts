import { Injectable } from '@nestjs/common';
import { ITenantRepository } from '../repositories/tenant.repository.interface';
import { IUserRepository } from '../repositories/user.repository.interface';
import { User } from '../entities/user.entity';
import { Email } from '../value-objects/email.value-object';
import { PhoneNumber } from '../value-objects/phone-number.value-object';
import {
  PasswordHash,
  PasswordHasher,
} from '../value-objects/password-hash.value-object';
import { InvitationCode } from '../value-objects/invitation-code.value-object';
import {
  EmailAlreadyExistsException,
  InvalidInvitationCodeException,
  PhoneNumberAlreadyExistsException,
  TenantNotFoundException,
} from '../exceptions/domain.exceptions';

@Injectable()
export class RegistrationDomainService {
  constructor(
    private readonly tenantRepository: ITenantRepository,
    private readonly userRepository: IUserRepository,
    private readonly passwordHasher: PasswordHasher,
  ) {}

  async registerUser(
    emailString: string,
    plainPassword: string,
    phoneNumberString?: string,
    invitationCodeString?: string,
  ): Promise<User> {
    const email = Email.create(emailString);
    const phoneNumber = phoneNumberString
      ? PhoneNumber.create(phoneNumberString)
      : undefined;

    // Check email uniqueness
    const existingUserByEmail = await this.userRepository.findByEmail(email);
    if (existingUserByEmail) {
      throw new EmailAlreadyExistsException(emailString);
    }

    // Check phone number uniqueness
    if (phoneNumber) {
      const phoneExists = await this.userRepository.existsByPhone(phoneNumber);
      if (phoneExists) {
        throw new PhoneNumberAlreadyExistsException(phoneNumberString ?? '');
      }
    }

    // Validate invitation code and get tenant
    let tenantId: number;
    if (invitationCodeString) {
      const invitationCode = InvitationCode.create(invitationCodeString);
      const tenant =
        await this.tenantRepository.findByInvitationCode(invitationCode);
      if (!tenant || !tenant.isInvitationValid(invitationCodeString)) {
        throw new InvalidInvitationCodeException();
      }
      tenantId = tenant.id;
    } else {
      // For now, require invitation code. Adjust if needed.
      throw new InvalidInvitationCodeException();
    }

    // Hash password
    const hashedPasswordString = await this.passwordHasher.hash(plainPassword);
    const hashedPassword = PasswordHash.create(hashedPasswordString);

    // Create user
    const user = new User(tenantId, email, hashedPassword, phoneNumber);

    return user;
  }
}

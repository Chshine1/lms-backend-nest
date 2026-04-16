import { Inject, Injectable } from '@nestjs/common';
import type { ITenantRepository, IUserRepository } from '../repositories/index';
import {
  TenantRepository,
  UserRepository,
} from '../../infrastructure/repositories/index';
import { User } from '../entities/user.entity';
import {
  EmailAlreadyExistsError,
  InvalidInvitationCodeError,
  PhoneNumberAlreadyExistsError,
} from '../errors/index';
import {
  EmailVo,
  InvitationCodeVo,
  PasswordHashVo,
  PhoneNumberVo,
} from '../value-objects/index';
import { PasswordHashService } from '../../infrastructure/services/password-hash.service';

@Injectable()
export class RegistrationService {
  constructor(
    @Inject(TenantRepository)
    private readonly tenantRepository: ITenantRepository,
    @Inject(UserRepository)
    private readonly userRepository: IUserRepository,
    private readonly passwordHashService: PasswordHashService,
  ) {}

  async registerUser(
    emailString: string,
    plainPassword: string,
    phoneNumberString?: string,
    invitationCodeString?: string,
  ): Promise<User> {
    const email = EmailVo.create(emailString);
    const phoneNumber = phoneNumberString
      ? PhoneNumberVo.create(phoneNumberString)
      : undefined;

    const existingUserByEmail = await this.userRepository.findByEmail(email);
    if (existingUserByEmail) {
      throw new EmailAlreadyExistsError(emailString);
    }

    if (phoneNumber) {
      const phoneExists = await this.userRepository.existsByPhone(phoneNumber);
      if (phoneExists) {
        throw new PhoneNumberAlreadyExistsError(phoneNumberString ?? '');
      }
    }

    let tenantId: bigint;
    if (invitationCodeString) {
      const invitationCode = InvitationCodeVo.create(invitationCodeString);
      const tenant =
        await this.tenantRepository.findByInvitationCode(invitationCode);
      if (!tenant || !tenant.isInvitationValid(invitationCodeString)) {
        throw new InvalidInvitationCodeError();
      }
      tenantId = tenant.id;
    } else {
      // Per DOMAIN.md §3.1: "derives tenantId from invitation code or uses default tenant"
      // Use default tenant (ID: 1) when no invitation code provided
      // NOTE: This assumes a default tenant with ID 1 exists; should be created during system initialization
      tenantId = 1n;
    }

    const hashedPasswordString =
      await this.passwordHashService.hash(plainPassword);
    const hashedPassword = PasswordHashVo.create(hashedPasswordString);

    return new User(tenantId, email, hashedPassword, phoneNumber);
  }
}

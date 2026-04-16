import { Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { IUserRepository } from '../../domain/repositories/index';
import { UserRepository } from '../../infrastructure/repositories/index';
import { RegistrationService } from '@/user-service/src/domain/services/registration.service';
import {
  AccountCreated,
  EmailVerified,
} from '../../domain/events/domain.events';
import { RegisterUserDto, UserDto } from '@app/contracts';
import { User } from '@/user-service/src/domain/entities/user.entity';
import { EventBusService } from '@app/event-bus';
import { PasswordHashService } from '@/user-service/src/infrastructure/services/password-hash.service';
import { EmailVo } from '@/user-service/src/domain/value-objects/email.vo';
import { EmailVerificationService } from './email-verification.service';
import {
  EmailAlreadyExistsError,
  UnauthorizedActionError,
} from '../../domain/errors/index';

@Injectable()
export class UserApplicationService {
  constructor(
    @Inject(UserRepository)
    private readonly userRepository: IUserRepository,
    private readonly registrationDomainService: RegistrationService,
    private readonly eventBus: EventBusService,
    private readonly passwordHashService: PasswordHashService,
    private readonly emailVerificationService: EmailVerificationService,
    private readonly jwtService: JwtService,
  ) {}

  async registerByEmail(dto: RegisterUserDto): Promise<UserDto> {
    const user = await this.registrationDomainService.registerUser(
      dto.email,
      dto.password,
      dto.phoneNumber,
      dto.invitationCode,
    );

    await this.userRepository.save(user);

    const event = new AccountCreated(
      user.id,
      user.email.value,
      user.tenantId,
      user.createdAt,
    );
    await this.eventBus.publish(event);

    return this.mapToDto(user);
  }

  async findById(userId: bigint): Promise<UserDto | null> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      return null;
    }
    return this.mapToDto(user);
  }

  async authenticate(username: string, password: string): Promise<string> {
    const email = EmailVo.create(username);
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new UnauthorizedActionError('login');
    }

    const isValid = await this.passwordHashService.compare(
      password,
      user.passwordHash.value,
    );
    if (!isValid) {
      throw new UnauthorizedActionError('login');
    }

    // Per DOMAIN.md §3.1: "Generate JWT token with claims: userId (subject), exp (1 hour from now)"
    const token = this.jwtService.sign(
      { sub: user.id.toString() },
      { expiresIn: '1h' },
    );
    return token;
  }

  async requestEmailVerification(email: string): Promise<void> {
    // Check if email is already registered
    const emailVo = EmailVo.create(email);
    const existingUser = await this.userRepository.findByEmail(emailVo);
    if (existingUser) {
      throw new EmailAlreadyExistsError(email);
    }

    // Request verification code and send email
    await this.emailVerificationService.requestEmailVerification(email);
  }

  async verifyEmailAndIssueToken(
    email: string,
    code: string,
  ): Promise<{ registrationToken: string }> {
    // Validate code and issue token
    return await this.emailVerificationService.verifyEmailAndIssueToken(
      email,
      code,
    );
  }

  async completeRegistration(
    registrationToken: string,
    plainPassword: string,
    invitationCode?: string,
  ): Promise<UserDto> {
    // Verify token and extract email
    const { email, jti } =
      await this.emailVerificationService.verifyRegistrationToken(
        registrationToken,
      );

    // Create user via registration service
    const user = await this.registrationDomainService.registerUser(
      email,
      plainPassword,
      undefined, // phoneNumber is optional
      invitationCode,
    );

    // Save user
    await this.userRepository.save(user);

    // Mark token as consumed
    await this.emailVerificationService.consumeRegistrationToken(
      jti,
      new Date(Date.now() + 15 * 60 * 1000), // 15 minutes from now
    );

    // Publish event
    const event = new AccountCreated(
      user.id,
      user.email.value,
      user.tenantId,
      user.createdAt,
    );
    await this.eventBus.publish(event);

    return this.mapToDto(user);
  }

  async verifyEmail(userId: bigint): Promise<void> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new UnauthorizedActionError('verify-email');
    }

    user.markEmailVerified();
    await this.userRepository.save(user);

    const event = new EmailVerified(userId, new Date());
    await this.eventBus.publish(event);
  }

  private mapToDto(user: User): UserDto {
    const dto = new UserDto();
    dto.id = user.id;
    dto.tenantId = user.tenantId;
    dto.email = user.email.value;
    dto.phoneNumber = user.phoneNumber?.value;
    dto.status = user.status;
    dto.createdAt = user.createdAt;
    dto.updatedAt = user.updatedAt;
    return dto;
  }
}

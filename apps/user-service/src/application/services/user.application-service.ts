import { Inject, Injectable } from '@nestjs/common';
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

@Injectable()
export class UserApplicationService {
  constructor(
    @Inject(UserRepository)
    private readonly userRepository: IUserRepository,
    private readonly registrationDomainService: RegistrationService,
    private readonly eventBus: EventBusService,
    private readonly passwordHashService: PasswordHashService,
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
      throw new Error('Invalid credentials');
    }

    const isValid = await this.passwordHashService.compare(
      password,
      user.passwordHash.value,
    );
    if (!isValid) {
      throw new Error('Invalid credentials');
    }

    return `token-${user.id.toString()}`;
  }

  async verifyEmail(userId: bigint): Promise<void> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new Error('User not found');
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

import { Injectable } from '@nestjs/common';
import type { IUserRepository } from '../../domain/repositories/index';
import { RegistrationService } from '@/user-service/src/domain/services/registration.service';
import { AccountCreated } from '../../domain/events/domain.events';
import { RegisterUserDto, UserDto } from '@app/contracts';
import { User } from '@/user-service/src/domain/entities/user.entity';

@Injectable()
export class UserApplicationService {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly registrationDomainService: RegistrationService,
  ) {}

  async registerByEmail(dto: RegisterUserDto): Promise<UserDto> {
    // Use domain service to create user
    const user = await this.registrationDomainService.registerUser(
      dto.email,
      dto.password,
      dto.phoneNumber,
      dto.invitationCode,
    );

    // Save user
    await this.userRepository.save(user);

    // Publish event (in a real implementation, use an event bus)
    const event = new AccountCreated(
      user.id,
      user.email.value,
      user.tenantId,
      user.createdAt,
    );
    // TODO: Publish event to event bus
    console.log('Event:', event);

    // Map to DTO
    return this.mapToDto(user);
  }

  async findById(userId: bigint): Promise<UserDto | null> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      return null;
    }
    return this.mapToDto(user);
  }

  private mapToDto(user: User): UserDto {
    const dto = new UserDto();
    dto.id = user.id;
    dto.tenantId = user.tenantId;
    dto.email = user.email.value;
    dto.phoneNumber = user.phoneNumber?.value;
    dto.status = user.status as UserDto['status'];
    dto.createdAt = user.createdAt;
    dto.updatedAt = user.updatedAt;
    return dto;
  }
}

import { Injectable } from '@nestjs/common';
import { IUserRepository } from '@/user-service/src/domain/repositories/user.repository.interface';
import { RegistrationDomainService } from '@/user-service/src/domain/services/registration-domain.service';
import { RegisterUserDto } from '../dtos/register-user.dto';
import { UserDto } from '../dtos/user.dto';
import { AccountCreated } from '@/user-service/src/domain/events/domain.events';

@Injectable()
export class UserApplicationService {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly registrationDomainService: RegistrationDomainService,
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
      user.getEmail().getValue(),
      user.tenantId,
      user.createdAt,
    );
    // TODO: Publish event to event bus
    console.log('Event:', event);

    // Map to DTO
    return this.mapToDto(user);
  }

  async findById(userId: number): Promise<UserDto | null> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      return null;
    }
    return this.mapToDto(user);
  }

  private mapToDto(user: {
    id: number;
    tenantId: number;
    getEmail: () => { getValue: () => string };
    getPhoneNumber: () => { getValue: () => string } | undefined;
    status: string;
    createdAt: Date;
    updatedAt: Date;
  }): UserDto {
    const dto = new UserDto();
    dto.id = user.id;
    dto.tenantId = user.tenantId;
    dto.email = user.getEmail().getValue();
    dto.phoneNumber = user.getPhoneNumber()?.getValue();
    dto.status = user.status as UserDto['status'];
    dto.createdAt = user.createdAt;
    dto.updatedAt = user.updatedAt;
    return dto;
  }
}

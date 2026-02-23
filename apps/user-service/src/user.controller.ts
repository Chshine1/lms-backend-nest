import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { UserService } from './user.service';
import { UserContract } from '@app/contracts/user/entities/user.contract';
import { CreateUserDto } from '@app/contracts/user/dto/create-user.dto';
import { ValidateUserDto } from '@app/contracts/user/dto/validate-user.dto';

@Controller()
export class UserController {
  constructor(private readonly userService: UserService) {}

  @MessagePattern('user.create')
  createUser(@Payload() createUserDto: CreateUserDto): Promise<UserContract> {
    return this.userService.create(createUserDto);
  }

  @MessagePattern('user.validate')
  validateUser(@Payload() data: ValidateUserDto): Promise<UserContract | null> {
    return this.userService.validateUser(data.username, data.password);
  }

  @MessagePattern('user.findById')
  findUserById(@Payload() data: { id: number }): Promise<UserContract | null> {
    return this.userService.findById(data.id);
  }

  @MessagePattern('user.findByTenant')
  findByTenant(@Payload() data: { tenantId: number }): Promise<UserContract[]> {
    return this.userService.findByTenant(data.tenantId);
  }
}

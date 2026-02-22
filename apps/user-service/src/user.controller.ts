import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { ValidateUserDto } from './dto/validate-user.dto';
import { User } from '@/user-service/src/entities/user.entity';

@Controller()
export class UserController {
  constructor(private readonly userService: UserService) {}

  @MessagePattern('user.create')
  async createUser(@Payload() createUserDto: CreateUserDto): Promise<User> {
    return await this.userService.create(createUserDto);
  }

  @MessagePattern('user.validate')
  async validateUser(@Payload() data: ValidateUserDto): Promise<User | null> {
    return await this.userService.validateUser(data.username, data.password);
  }

  @MessagePattern('user.findById')
  async findUserById(@Payload() data: { id: number }): Promise<User | null> {
    return await this.userService.findById(data.id);
  }

  @MessagePattern('user.findByTenant')
  async findByTenant(@Payload() data: { tenantId: number }): Promise<User[]> {
    return await this.userService.findByTenant(data.tenantId);
  }
}

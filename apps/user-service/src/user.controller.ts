import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { ValidateUserDto } from './dto/validate-user.dto';

@Controller()
export class UserController {
  constructor(private readonly userService: UserService) {}

  @MessagePattern('user.create')
  async createUser(@Payload() createUserDto: CreateUserDto) {
    const user = await this.userService.create(createUserDto);
    const { password, ...result } = user;
    return result;
  }

  @MessagePattern('user.validate')
  async validateUser(@Payload() data: ValidateUserDto) {
    const user = await this.userService.validateUser(
      data.username,
      data.password,
    );
    if (user) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  @MessagePattern('user.findById')
  async findUserById(@Payload() data: { id: number }) {
    const user = await this.userService.findById(data.id);
    if (user) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  @MessagePattern('user.findByTenant')
  async findByTenant(@Payload() data: { tenantId: number }) {
    const users = await this.userService.findByTenant(data.tenantId);
    return users.map((u) => {
      const { password, ...result } = u;
      return result;
    });
  }
}

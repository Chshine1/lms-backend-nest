import { Body, Controller, Post } from '@nestjs/common';
import { CreateUserDto, UserContract } from '@app/contracts';
import { UserTypedClient } from '@app/typed-client';

@Controller('users')
export class UserController {
  constructor(private readonly userClient: UserTypedClient) {}

  @Post()
  async register(@Body() body: CreateUserDto): Promise<{
    user: UserContract;
  }> {
    const user = await this.userClient.createUser(body);
    return {
      user,
    };
  }
}

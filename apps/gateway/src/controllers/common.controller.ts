import { Body, Controller, Post } from '@nestjs/common';
import { UserTypedClient } from '@app/typed-client';

@Controller()
export class CommonController {
  constructor(private readonly userClient: UserTypedClient) {}

  @Post('login')
  async login(@Body() body: { username: string; password: string }): Promise<{
    accessToken: string;
  }> {
    return await this.userClient.userLogin(body);
  }
}

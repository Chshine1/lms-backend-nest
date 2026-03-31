import { Body, Controller, Post } from '@nestjs/common';
import { UserTypedClient } from '@app/typed-client';
import { UserLoginDto } from '@app/contracts';

@Controller()
export class CommonController {
  constructor(private readonly userClient: UserTypedClient) {}

  @Post('login')
  async login(@Body() body: UserLoginDto): Promise<{
    accessToken: string;
  }> {
    const accessToken = await this.userClient.userLogin(body);
    return {
      accessToken,
    };
  }
}

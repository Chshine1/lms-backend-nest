import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Post,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { UserClientService } from './user-client/user-client.service';
import { AuthGuard } from '@nestjs/passport';
import { JwtService } from '@nestjs/jwt';
import { UserContract } from '@app/contracts/user/entities/user.contract';
import { CreateUserDto } from '@app/contracts/user/dto/create-user.dto';

@Controller()
export class AppController {
  constructor(
    private readonly userClient: UserClientService,
    private readonly jwtService: JwtService,
  ) {}

  @Post('auth/register')
  async register(
    @Body()
    body: CreateUserDto,
  ): Promise<{
    access_token: string;
    user: UserContract;
  }> {
    const user = await this.userClient.createUser(body);
    const payload = { sub: user.id, username: user.username };
    return {
      access_token: this.jwtService.sign(payload),
      user,
    };
  }

  @Post('auth/login')
  async login(@Body() body: { username: string; password: string }): Promise<{
    access_token: string;
    user: UserContract;
  }> {
    const user = await this.userClient.validateUser(body);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const payload = { sub: user.id, username: user.username };
    return {
      access_token: this.jwtService.sign(payload),
      user,
    };
  }

  @Get('users/:id')
  @UseGuards(AuthGuard('jwt'))
  async getUser(@Param('id') id: string): Promise<UserContract> {
    const user = await this.userClient.findUserById(parseInt(id));
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }
}

import {
  Body,
  Controller,
  Get,
  InternalServerErrorException,
  NotFoundException,
  Param,
  Post,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { JwtService } from '@nestjs/jwt';
import { CreateUserDto, UserContract } from '@app/contracts';
import { UserTypedClient } from '@app/typed-client';

@Controller()
export class AppController {
  constructor(
    private readonly userClient: UserTypedClient,
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
    try {
      const user = await this.userClient.createUser(body);
      const payload = { sub: user.id, username: user.username };
      return {
        access_token: this.jwtService.sign(payload),
        user,
      };
    } catch {
      throw new InternalServerErrorException('Failed to create user');
    }
  }

  @Post('auth/login')
  async login(@Body() body: { username: string; password: string }): Promise<{
    access_token: string;
    user: UserContract;
  }> {
    let user: UserContract | null;
    try {
      user = await this.userClient.validateUser(body);
    } catch {
      throw new InternalServerErrorException('Failed to validate user');
    }

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
    let user: UserContract | null;
    try {
      user = await this.userClient.findUserById(parseInt(id));
    } catch {
      throw new InternalServerErrorException('Failed to retrieve user');
    }

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }
}

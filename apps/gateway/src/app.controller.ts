import {
  BadRequestException,
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
import { TenantClientService } from './tenant-client/tenant-client.service';
import { AuthGuard } from '@nestjs/passport';
import { JwtService } from '@nestjs/jwt';

@Controller()
export class AppController {
  constructor(
    private readonly userClient: UserClientService,
    private readonly tenantClient: TenantClientService,
    private readonly jwtService: JwtService,
  ) {}

  @Post('auth/register')
  async register(
    @Body()
    body: {
      username: string;
      password: string;
      email: string;
      tenantId?: number;
    },
  ): Promise<{
    access_token: string;
    user: import('../../../libs/common').SharedUser;
  }> {
    if (body.tenantId) {
      const tenantExists = await this.tenantClient.validateTenant(
        body.tenantId,
      );
      if (!tenantExists) {
        throw new BadRequestException('Tenant not found');
      }
    }
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
    user: import('../../../libs/common').SharedUser;
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
  async getUser(
    @Param('id') id: string,
  ): Promise<import('../../../libs/common').SharedUser> {
    const user = await this.userClient.findUserById(parseInt(id));
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  @Post('tenants')
  @UseGuards(AuthGuard('jwt'))
  async createTenant(
    @Body()
    body: {
      name: string;
      description?: string;
      subscriptionPlan?: string;
    },
  ): Promise<import('../../../libs/common').SharedTenant> {
    return await this.tenantClient.createTenant(body);
  }

  @Get('tenants/:id')
  @UseGuards(AuthGuard('jwt'))
  async getTenant(
    @Param('id') id: string,
  ): Promise<import('../../../libs/common').SharedTenant> {
    const tenant = await this.tenantClient.findTenantById(parseInt(id));
    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }
    return tenant;
  }

  @Get('tenants/:tenantId/users')
  @UseGuards(AuthGuard('jwt'))
  async getTenantUsers(
    @Param('tenantId') tenantId: string,
  ): Promise<import('../../../libs/common').SharedUser[]> {
    return await this.userClient.findUsersByTenant(parseInt(tenantId));
  }
}

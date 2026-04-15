import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import {
  AssignRoleDto,
  CompleteOnboardingDto,
  LinkParentStudentDto,
  RegisterUserDto,
  UserDto,
} from '@app/contracts';
import { UserTypedClient } from '@app/typed-client';

@Controller('users')
export class UserController {
  constructor(private readonly userClient: UserTypedClient) {}

  @Post()
  async register(@Body() body: RegisterUserDto): Promise<UserDto> {
    return await this.userClient.registerUser(body);
  }

  @Get(':id')
  async findUserById(@Param('id') id: string): Promise<UserDto | null> {
    return await this.userClient.findUserById({ userId: BigInt(id) });
  }

  @Post('roles')
  async assignRole(
    @Body() body: AssignRoleDto & { adminUserId: bigint },
  ): Promise<void> {
    await this.userClient.assignRole({
      adminUserId: body.adminUserId,
      targetUserId: body.targetUserId,
      roleId: body.roleId,
    });
  }

  @Post('parent-student-link')
  async linkParentStudent(@Body() body: LinkParentStudentDto): Promise<void> {
    await this.userClient.linkParentStudent({
      parentUserId: body.parentUserId,
      studentUserId: body.studentUserId,
    });
  }

  @Post('onboarding')
  async completeOnboarding(@Body() body: CompleteOnboardingDto): Promise<void> {
    await this.userClient.completeOnboarding({
      studentUserId: body.studentUserId,
      signatureData: body.signatureData ?? {},
    });
  }
}

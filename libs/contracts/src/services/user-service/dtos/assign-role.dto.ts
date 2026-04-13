import { IsNotEmpty, IsNumber } from 'class-validator';

export class AssignRoleDto {
  @IsNumber()
  @IsNotEmpty()
  targetUserId!: bigint;

  @IsNumber()
  @IsNotEmpty()
  roleId!: bigint;
}

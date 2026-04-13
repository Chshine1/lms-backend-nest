import { IsNotEmpty, IsNumber } from 'class-validator';

export class AssignRoleDto {
  @IsNumber()
  @IsNotEmpty()
  targetUserId!: number;

  @IsNumber()
  @IsNotEmpty()
  roleId!: number;
}

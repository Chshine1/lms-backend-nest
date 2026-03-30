import { ApiProperty } from '@nestjs/swagger';
import { IdentityType, UserStatus } from '../entities/index';

export class StudentBatchDto {
  @ApiProperty({ required: false })
  studentId?: string;
}

export class TeacherBatchDto {
  @ApiProperty({ required: false })
  employeeId?: string;

  @ApiProperty({ required: false })
  qualifications?: string;

  @ApiProperty({ required: false })
  hireDate?: Date;
}

export class BatchUpdateUserDto {
  @ApiProperty({ required: false })
  username?: string;

  @ApiProperty({ required: false })
  email?: string;

  @ApiProperty({ required: false })
  phone?: string;

  @ApiProperty({ required: false })
  passwordHash?: string;

  @ApiProperty({ required: false })
  status?: UserStatus;

  @ApiProperty({ required: false })
  identityType?: IdentityType;

  @ApiProperty({ required: false })
  derivation?: StudentBatchDto | TeacherBatchDto;
}

import { ApiProperty } from '@nestjs/swagger';
import {
  IdentityType,
  StudentBatchDto,
  TeacherBatchDto,
  UserStatus,
} from '../index';

export class CreateUserDto {
  @ApiProperty()
  username!: string;

  @ApiProperty()
  email!: string;

  @ApiProperty()
  phone!: string;

  @ApiProperty()
  status!: UserStatus;

  @ApiProperty()
  identityType!: IdentityType;

  @ApiProperty()
  derivation!: StudentBatchDto | TeacherBatchDto;

  @ApiProperty()
  password!: string;
}

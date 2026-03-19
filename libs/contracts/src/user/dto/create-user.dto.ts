import {
  IsDefined,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsString,
} from 'class-validator';
import { IdentityType } from '@app/contracts/user/entities/user.contract';
import { Transform } from 'class-transformer';

export class CreateUserDto {
  @IsDefined()
  @IsString()
  @IsNotEmpty()
  username!: string;

  @IsDefined()
  @IsString()
  @IsEmail()
  email!: string;

  @IsDefined()
  @IsString()
  @IsEmail()
  phone!: string;

  @IsDefined()
  @IsString()
  @IsNotEmpty()
  password!: string;

  @IsEnum(IdentityType)
  @Transform(({ value }) => {
    const map: Record<string, IdentityType> = {
      student: IdentityType.STUDENT,
      teacher: IdentityType.TEACHER,
      parent: IdentityType.PARENT,
      admin: IdentityType.ADMIN,
    };
    return map[String(value).toLowerCase()];
  })
  identityType!: IdentityType;
}

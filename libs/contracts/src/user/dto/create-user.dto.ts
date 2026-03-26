import {
  IsDefined,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsString,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { IdentityType } from '../entities';

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
  @IsNotEmpty()
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

import { IsNotEmpty, IsString, IsArray, IsBigInt } from 'class-validator';

export class CreateCourseDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsNotEmpty()
  code!: string;

  @IsString()
  description!: string;

  @IsArray()
  @IsBigInt({ each: true })
  teacherIds!: bigint[];
}

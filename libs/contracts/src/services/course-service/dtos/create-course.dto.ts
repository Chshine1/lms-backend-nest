import { IsNotEmpty, IsString, IsArray, IsNumber } from 'class-validator';

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
  @IsNumber()
  teacherIds!: bigint[];
}

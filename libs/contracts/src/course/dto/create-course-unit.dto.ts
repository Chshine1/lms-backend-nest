import { IsDefined, IsInt, IsOptional, IsString } from 'class-validator';

export class CreateCourseUnitDto {
  @IsDefined()
  @IsInt()
  courseId!: number;

  @IsDefined()
  @IsString()
  title!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsDefined()
  @IsInt()
  order!: number;
}

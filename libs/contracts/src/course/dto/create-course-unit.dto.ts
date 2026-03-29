import {
  IsDefined,
  IsString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
} from 'class-validator';

export class CreateCourseUnitDto {
  @IsDefined()
  @IsNumber()
  courseId!: number;

  @IsDefined()
  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsDefined()
  @IsNumber()
  order!: number;
}

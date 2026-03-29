import { IsOptional, IsString, IsNotEmpty, IsNumber } from 'class-validator';

export class UpdateCourseUnitDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsNumber()
  order?: number;
}

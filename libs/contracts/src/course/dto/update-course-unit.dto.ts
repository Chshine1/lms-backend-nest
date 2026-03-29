import { IsInt, IsOptional, IsString } from 'class-validator';

export class UpdateCourseUnitDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsInt()
  order?: number;
}

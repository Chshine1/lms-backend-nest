import { IsOptional, IsString, IsNotEmpty } from 'class-validator';

export class UpdateCourseMaterialDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;
}

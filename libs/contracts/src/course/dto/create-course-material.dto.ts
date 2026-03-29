import {
  IsDefined,
  IsString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
} from 'class-validator';

export class CreateCourseMaterialDto {
  @IsDefined()
  @IsNumber()
  courseUnitId!: number;

  @IsDefined()
  @IsNumber()
  fileId!: number;

  @IsDefined()
  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsDefined()
  @IsString()
  @IsNotEmpty()
  uploaderId!: string;
}

import {
  IsOptional,
  IsString,
  IsNotEmpty,
  IsNumber,
  IsArray,
} from 'class-validator';

export class UpdateCourseDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  name?: string;

  @IsOptional()
  @IsNumber()
  tenantId?: number;

  @IsOptional()
  @IsNumber()
  campusId?: number;

  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  teachers?: number[];
}

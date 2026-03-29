import {
  IsDefined,
  IsString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsArray,
} from 'class-validator';

export class CreateCourseDto {
  @IsDefined()
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsDefined()
  @IsNumber()
  tenantId!: number;

  @IsDefined()
  @IsNumber()
  campusId!: number;

  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  teachers?: number[];
}

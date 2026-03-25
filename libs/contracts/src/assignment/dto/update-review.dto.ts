import { IsNumber, IsString, IsOptional } from 'class-validator';

export class UpdateReviewDto {
  @IsNumber()
  @IsOptional()
  score?: number;

  @IsString()
  @IsOptional()
  feedback?: string;
}

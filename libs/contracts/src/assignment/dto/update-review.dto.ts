import { IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateReviewDto {
  @IsNumber()
  @IsOptional()
  score?: number;

  @IsString()
  @IsOptional()
  feedback?: string;
}

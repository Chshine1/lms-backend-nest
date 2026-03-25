import { IsDefined, IsNumber, IsString } from 'class-validator';

export class CreateReviewDto {
  @IsDefined()
  @IsNumber()
  teacherId!: number;

  @IsDefined()
  @IsNumber()
  score!: number;

  @IsString()
  feedback!: string;
}

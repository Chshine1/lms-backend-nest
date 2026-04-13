import { IsNotEmpty, IsNumber, IsObject, IsOptional } from 'class-validator';

export class CompleteOnboardingDto {
  @IsNumber()
  @IsNotEmpty()
  studentUserId!: number;

  @IsObject()
  @IsOptional()
  signatureData?: Record<string, unknown>;
}

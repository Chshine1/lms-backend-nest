import { IsDefined, IsString, Length } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateTenantDto {
  @IsDefined()
  @IsString()
  @Length(2, 31)
  @Transform(({ value }) => (value as string).trim())
  name!: string;

  @IsString()
  description?: string;

  @IsString()
  subscriptionPlan?: string;
}

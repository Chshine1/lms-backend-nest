import { IsDefined, IsNumber, IsString } from 'class-validator';

export class CreateFileDto {
  @IsDefined()
  @IsString()
  checksum!: string;

  @IsDefined()
  @IsNumber()
  createdBy!: number;
}

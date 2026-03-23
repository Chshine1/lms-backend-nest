import { IsDefined, IsNumber, IsString } from 'class-validator';

export class CreateFileDto {
  @IsDefined()
  @IsString()
  storageKey!: string;

  @IsDefined()
  @IsString()
  contentType!: string;

  @IsDefined()
  @IsNumber()
  size!: number;

  @IsDefined()
  @IsString()
  checksum!: string;

  @IsDefined()
  @IsNumber()
  createdBy!: number;
}

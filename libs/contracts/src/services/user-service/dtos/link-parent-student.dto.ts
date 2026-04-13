import { IsNotEmpty, IsNumber } from 'class-validator';

export class LinkParentStudentDto {
  @IsNumber()
  @IsNotEmpty()
  parentUserId!: bigint;

  @IsNumber()
  @IsNotEmpty()
  studentUserId!: bigint;
}

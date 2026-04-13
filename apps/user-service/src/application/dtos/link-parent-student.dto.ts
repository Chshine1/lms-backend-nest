import { IsNotEmpty, IsNumber } from 'class-validator';

export class LinkParentStudentDto {
  @IsNumber()
  @IsNotEmpty()
  parentUserId!: number;

  @IsNumber()
  @IsNotEmpty()
  studentUserId!: number;
}

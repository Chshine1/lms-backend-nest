import { IsDefined, IsNumber } from 'class-validator';

export class CreateEnrollmentDto {
  @IsDefined()
  @IsNumber()
  studentId!: number;

  @IsDefined()
  @IsNumber()
  courseId!: number;
}

import { Expose } from 'class-transformer';

export class StudentContract {
  @Expose()
  userId!: number;

  @Expose()
  studentId!: string;
}

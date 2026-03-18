import { Expose } from 'class-transformer';

export class TeacherContract {
  @Expose()
  userId!: number;

  @Expose()
  employeeId!: string;

  @Expose()
  qualifications!: string;

  @Expose()
  hireDate!: Date;
}

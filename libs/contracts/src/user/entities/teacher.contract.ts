import { Expose } from 'class-transformer';

export class TeacherContract {
  @Expose()
  userId!: number;

  @Expose()
  teacherNo!: string;

  @Expose()
  subjects!: string[];

  @Expose()
  homeCampusId!: number;

  @Expose()
  qualification!: string;
}

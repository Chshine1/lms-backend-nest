import { Column, Entity, PrimaryColumn } from 'typeorm';
import { StudentContract } from '@app/contracts/user/entities/student.contract';

@Entity('students')
export class Student implements StudentContract {
  @PrimaryColumn({ name: 'user_id' })
  userId!: number;

  @Column({ name: 'student_id' })
  studentId!: string;

  @Column({ name: 'grade_level' })
  gradeLevel!: string;

  @Column({ name: 'enrollment_date', type: 'date' })
  enrollmentDate!: Date;
}

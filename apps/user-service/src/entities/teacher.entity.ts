import { Column, Entity, PrimaryColumn } from 'typeorm';
import { TeacherContract } from '@app/contracts';

@Entity('teachers')
export class Teacher implements TeacherContract {
  @PrimaryColumn({ name: 'user_id' })
  userId!: number;

  @Column({ name: 'employee_id' })
  employeeId!: string;

  @Column({ type: 'text' })
  qualifications!: string;

  @Column({ name: 'hire_date', type: 'date' })
  hireDate!: Date;
}

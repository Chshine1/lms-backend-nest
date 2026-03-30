import { Column, Entity, JoinColumn, OneToOne, PrimaryColumn } from 'typeorm';
import { TeacherContract } from '@app/contracts';
import { User } from '@/user-service/src/entities/user/user.entity';

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

  @OneToOne(() => User, (user) => user.student, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'user_id' })
  user!: User;
}

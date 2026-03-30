import { Column, Entity, JoinColumn, OneToOne, PrimaryColumn } from 'typeorm';
import { StudentContract } from '@app/contracts';
import { User } from './user.entity';

@Entity('students')
export class Student implements StudentContract {
  @PrimaryColumn({ name: 'user_id' })
  userId!: number;

  @Column({ name: 'student_id' })
  studentId!: string;

  @OneToOne(() => User, (user) => user.student, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'user_id' })
  user!: User;
}

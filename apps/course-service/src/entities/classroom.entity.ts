import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  VersionColumn,
} from 'typeorm';
import {
  ClassroomContract,
  ClassroomStatus,
} from '@app/contracts/course/entities/classroom.contract';

@Entity('classrooms')
export class Classroom implements ClassroomContract {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'campus_id' })
  campusId!: number;

  @Column()
  name!: string;

  @Column()
  capacity!: number;

  @Column({ type: 'text' })
  specification!: string;

  @Column({ type: 'text' })
  equipment!: string;

  @Column({
    type: 'smallint',
    default: ClassroomStatus.AVAILABLE,
  })
  status!: ClassroomStatus;

  @Column({ type: 'text', nullable: true })
  remarks?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt?: Date;

  @VersionColumn()
  version!: number;
}

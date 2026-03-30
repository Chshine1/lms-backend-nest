import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { AssignmentContract, BaseEntity } from '@app/contracts';
import { CourseUnit } from './course-unit.entity';

@Entity('assignments')
export class Assignment extends BaseEntity implements AssignmentContract {
  @Column({ name: 'course_unit_id' })
  courseUnitId!: number;

  @Column()
  title!: string;

  @Column({ type: 'text' })
  description!: string;

  @Column({ type: 'timestamp', name: 'due_date' })
  dueDate!: Date;

  @Column({ type: 'int', array: true, default: '{}' })
  attachments!: number[];

  @ManyToOne(() => CourseUnit, (unit) => unit.assignments, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'course_unit_id' })
  courseUnit!: CourseUnit;
}

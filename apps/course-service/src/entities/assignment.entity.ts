import { Column, Entity } from 'typeorm';
import { AssignmentContract, BaseEntity } from '@app/contracts';

@Entity('assignments')
export class Assignment extends BaseEntity implements AssignmentContract {
  @Column({ name: 'course_unit_id' })
  courseUnitId!: number;

  @Column()
  title!: string;

  @Column({ type: 'text' })
  description!: string;

  @Column({ type: 'timestamp' })
  dueDate!: Date;

  @Column({ type: 'int', array: true, default: '{}' })
  attachments!: number[];
}

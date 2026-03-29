import { Column, Entity } from 'typeorm';
import { BaseEntity, CourseUnitContract } from '@app/contracts';

@Entity('course_units')
export class CourseUnit extends BaseEntity implements CourseUnitContract {
  @Column({ name: 'course_id' })
  courseId!: number;

  @Column()
  title!: string;

  @Column({ type: 'text' })
  description!: string;

  @Column()
  order!: number;
}

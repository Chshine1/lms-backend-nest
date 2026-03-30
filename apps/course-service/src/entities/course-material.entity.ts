import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity, CourseMaterialContract } from '@app/contracts';
import { CourseUnit } from '@/course-service/src/entities/course-unit.entity';

@Entity('course_materials')
export class CourseMaterial
  extends BaseEntity
  implements CourseMaterialContract
{
  @Column({ name: 'course_unit_id' })
  courseUnitId!: number;

  @Column({ name: 'file_id' })
  fileId!: number;

  @Column()
  title!: string;

  @Column({ type: 'text' })
  description!: string;

  @Column({ name: 'uploader_id' })
  uploaderId!: number;

  @ManyToOne(() => CourseUnit, (unit) => unit.courseMaterials, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'course_unit_id' })
  courseUnit!: CourseUnit;
}

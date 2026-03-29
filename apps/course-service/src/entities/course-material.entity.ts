import { Column, Entity } from 'typeorm';
import { BaseEntity, CourseMaterialContract } from '@app/contracts';

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
  uploaderId!: string;
}

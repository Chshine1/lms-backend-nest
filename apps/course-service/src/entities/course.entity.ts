import { Column, Entity, OneToMany } from 'typeorm';
import { CourseUnit } from './course-unit.entity';
import { BaseEntity, CourseContract, CourseUnitBatchDto } from '@app/contracts';
import { CourseUnitCollection } from '@/course-service/src/entities/collections/course-unit.collection';

@Entity('courses')
export class Course extends BaseEntity implements CourseContract {
  @Column()
  name!: string;

  @Column({ type: 'text' })
  description!: string;

  @Column({ name: 'tenant_id' })
  tenantId!: number;

  @Column({ type: 'int', array: true, default: '{}' })
  teachers!: number[];

  @Column({ name: 'created_by' })
  createdBy!: number;

  @OneToMany(() => CourseUnit, (unit) => unit.course, {
    cascade: true,
  })
  courseUnits!: CourseUnit[];

  updateUnits(unitDtos: CourseUnitBatchDto[]): void {
    CourseUnitCollection.create(this, this.courseUnits).updateCourseUnits(
      unitDtos,
    );
  }
}

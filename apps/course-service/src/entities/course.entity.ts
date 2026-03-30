import { Entity, Column, OneToMany } from 'typeorm';
import { CourseUnit } from './course-unit.entity';
import { BaseEntity, CourseContract } from '@app/contracts';
import { Assignment } from '@/course-service/src/entities/assignment.entity';

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

  addUnit(title: string, description: string, position?: number): CourseUnit {
    if (this.courseUnits.length >= 50) {
      throw new Error('Course cannot have more than 50 units');
    }
    const order = position ?? this.courseUnits.length + 1;
    if (this.courseUnits.some((u) => u.position === order)) {
      throw new Error(`Unit with order ${String(order)} already exists`);
    }
    const unit = new CourseUnit();
    unit.title = title;
    unit.description = description;
    unit.position = order;
    unit.course = this;
    this.courseUnits.push(unit);
    return unit;
  }

  updateUnit(unitId: number, title?: string, description?: string): void {
    const unit = this.courseUnits.find((u) => u.id === unitId);
    if (!unit) throw new Error('Unit not found');
    if (title) unit.title = title;
    if (description) unit.description = description;
  }

  removeUnit(unitId: number): void {
    const index = this.courseUnits.findIndex((u) => u.id === unitId);
    if (index === -1) throw new Error('Unit not found');
    this.courseUnits.splice(index, 1);
  }

  addAssignmentToUnit(
    unitId: number,
    title: string,
    description: string,
    dueDate: Date,
  ): Assignment {
    const unit = this.courseUnits.find((u) => u.id === unitId);
    if (!unit) throw new Error('Unit not found');
    return unit.addAssignment(title, description, dueDate);
  }
}

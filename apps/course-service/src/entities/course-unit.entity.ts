import { Entity, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { Course } from './course.entity';
import { Assignment } from './assignment.entity';
import { CourseMaterial } from './course-material.entity';
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
  position!: number;

  @ManyToOne(() => Course, (course) => course.courseUnits, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'course_id' })
  course!: Course;

  @OneToMany(() => Assignment, (assignment) => assignment.courseUnit, {
    cascade: true,
  })
  assignments!: Assignment[];

  @OneToMany(() => CourseMaterial, (material) => material.courseUnit, {
    cascade: true,
  })
  courseMaterials!: CourseMaterial[];

  addAssignment(title: string, description: string, dueDate: Date): Assignment {
    const assignment = new Assignment();
    assignment.title = title;
    assignment.description = description;
    assignment.dueDate = dueDate;
    assignment.courseUnit = this;
    this.assignments.push(assignment);
    return assignment;
  }

  addMaterial(
    fileId: number,
    title: string,
    description: string,
    uploaderId: number,
  ): CourseMaterial {
    const material = new CourseMaterial();
    material.fileId = fileId;
    material.title = title;
    material.description = description;
    material.uploaderId = uploaderId;
    material.courseUnit = this;
    this.courseMaterials.push(material);
    return material;
  }
}

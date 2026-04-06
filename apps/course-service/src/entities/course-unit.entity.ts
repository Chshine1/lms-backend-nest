import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { Course } from './course.entity';
import { Assignment } from './assignment.entity';
import { CourseMaterial } from './course-material.entity';
import {
  AssignmentBatchDto,
  BaseEntity,
  CourseUnitContract,
} from '@app/contracts';
import { AssignmentCollection } from './collections/assignment.collection';

@Entity('course_units')
export class CourseUnit extends BaseEntity implements CourseUnitContract {
  @Column({ name: 'course_id' })
  courseId!: number;

  @Column()
  title!: string;

  @Column({ type: 'text' })
  description!: string;

  @Column({ type: 'double precision' })
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

  updateAssignments(assignmentDtos: AssignmentBatchDto[]): void {
    AssignmentCollection.create(this, this.assignments).updateAssignments(
      assignmentDtos,
    );
  }
}

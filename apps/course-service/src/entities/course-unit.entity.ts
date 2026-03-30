import { Entity, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { Course } from './course.entity';
import { Assignment } from './assignment.entity';
import { CourseMaterial } from './course-material.entity';
import {
  AssignmentBatchDto,
  BaseEntity,
  CourseUnitContract,
} from '@app/contracts';
import { BadRequestException } from '@nestjs/common';

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

  updateAssignments(assignmentDtos: AssignmentBatchDto[]): void {
    for (const dto of assignmentDtos) {
      if (dto.id !== undefined) {
        this.updateExistingAssignment(dto.id, dto);
      } else {
        this.createNewAssignment(dto);
      }
    }
  }

  private updateExistingAssignment(
    assignmentId: number,
    dto: AssignmentBatchDto,
  ): void {
    const assignment = this.assignments.find((a) => a.id === assignmentId);
    if (assignment === undefined) {
      throw new BadRequestException(
        `Assignment with id ${String(dto.id)} not found`,
      );
    }

    if (dto.title !== undefined) assignment.title = dto.title;
    if (dto.description !== undefined) assignment.description = dto.description;
    if (dto.dueDate !== undefined) assignment.dueDate = dto.dueDate;
  }

  private createNewAssignment(dto: AssignmentBatchDto): Assignment {
    if (
      dto.title === undefined ||
      dto.description === undefined ||
      dto.dueDate === undefined
    ) {
      throw new BadRequestException(
        'Missing required fields for new assignment',
      );
    }

    const assignment = new Assignment();

    assignment.title = dto.title;
    assignment.description = dto.description;
    assignment.dueDate = dto.dueDate;

    assignment.courseUnit = this;
    this.assignments.push(assignment);
    return assignment;
  }

  @OneToMany(() => CourseMaterial, (material) => material.courseUnit, {
    cascade: true,
  })
  courseMaterials!: CourseMaterial[];

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

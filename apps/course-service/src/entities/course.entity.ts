import { Entity, Column, OneToMany } from 'typeorm';
import { CourseUnit } from './course-unit.entity';
import { BaseEntity, CourseContract, UnitBatchDto } from '@app/contracts';
import { BadRequestException } from '@nestjs/common';

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

  updateUnits(unitDtos: UnitBatchDto[]): void {
    // TODO: This uses float ordering, precision boundary conditions need extra handling
    for (const dto of unitDtos) {
      if (dto.id !== undefined) {
        this.updateExistingUnit(dto.id, dto);
      } else {
        this.createNewUnit(dto);
      }
    }
  }

  private updateExistingUnit(id: number, dto: UnitBatchDto): void {
    const unit = this.courseUnits.find((u) => u.id === id);
    if (unit === undefined) {
      throw new BadRequestException(`Unit with id ${String(dto.id)} not found`);
    }

    if (dto.title !== undefined) unit.title = dto.title;
    if (dto.description !== undefined) unit.description = dto.description;
    if (dto.position !== undefined) unit.position = dto.position;

    if (dto.assignments !== undefined) {
      unit.updateAssignments(dto.assignments);
    }
  }

  createNewUnit(dto: UnitBatchDto): CourseUnit {
    if (
      dto.title === undefined ||
      dto.description === undefined ||
      dto.position === undefined
    ) {
      throw new BadRequestException(
        'Missing required fields for new course unit',
      );
    }

    const unit = new CourseUnit();

    unit.title = dto.title;
    unit.description = dto.description;
    unit.position = dto.position;

    if (dto.assignments !== undefined) {
      unit.updateAssignments(dto.assignments);
    }

    unit.course = this;
    this.courseUnits.push(unit);
    return unit;
  }
}

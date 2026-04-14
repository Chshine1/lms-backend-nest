import { defineEntity, p } from '@mikro-orm/core';
import {
  AggregateRootSchema,
  BigIntArrayType,
  BigIntArrayColumn,
} from '@app/contracts';
import { DuplicateUnitNameError } from '../errors/index';

const CourseSchema = defineEntity({
  name: 'Course',
  extends: AggregateRootSchema,
  tableName: 'courses',
  properties: {
    name: p.varchar(255),
    code: p.varchar(50).unique(),
    description: p.text().default(''),
    teachers: p.type(BigIntArrayType).default('{}'),
  },
});

export class Course extends CourseSchema.class {
  private units: { name: string; description: string }[] = [];

  addUnit(name: string, description: string): void {
    const exists = this.units.some(
      (u) => u.name.toLowerCase() === name.toLowerCase(),
    );
    if (exists) {
      throw new DuplicateUnitNameError(name);
    }
    this.units.push({ name, description });
  }

  updateMetadata(name: string, code: string, description: string): void {
    this.name = name;
    this.code = code;
    this.description = description;
  }

  assignTeacher(teacherId: bigint): void {
    const teachers = (this.teachers as bigint[]) || [];
    if (!teachers.includes(teacherId)) {
      (this.teachers as bigint[]).push(teacherId);
    }
  }
}

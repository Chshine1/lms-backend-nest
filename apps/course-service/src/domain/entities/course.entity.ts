import { defineEntity, p } from '@mikro-orm/core';
import { AggregateRootSchema, BigintArrayType } from '@app/contracts';
import { DuplicateUnitNameError } from '../errors/index';

const CourseSchema = defineEntity({
  name: 'Course',
  extends: AggregateRootSchema,
  tableName: 'courses',
  properties: {
    name: p.string().length(255),
    code: p.string().length(50).unique(),
    description: p.text().default(''),
    teachers: p.type(BigintArrayType).default('{}'),
  },
});

export class Course extends CourseSchema.class {
  declare description: string;
  declare teachers: bigint[];

  private units: { name: string; description: string }[] = [];

  constructor() {
    super();
    this.description = '';
    this.teachers = [];
  }

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
    const teachers = this.teachers;
    if (!teachers.includes(teacherId)) {
      this.teachers.push(teacherId);
    }
  }
}

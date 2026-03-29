import { Expose } from 'class-transformer';
import { BaseEntityContract } from '../../base-entity.contract';

export enum AssignmentType {
  HOMEWORK = 1,
  QUIZ = 2,
  EXAM = 3,
  PROJECT = 4,
}

export class AssignmentContract extends BaseEntityContract {
  @Expose()
  courseUnitId!: number;

  @Expose()
  title!: string;

  @Expose()
  description?: string;

  @Expose()
  type!: AssignmentType;

  @Expose()
  maxScore!: number;

  @Expose()
  dueDate?: Date;

  @Expose()
  order!: number;
}

import { Expose } from 'class-transformer';
import { BaseEntityContract } from '../../base-entity';

export class AssignmentContract extends BaseEntityContract {
  @Expose()
  courseUnitId!: number;

  @Expose()
  title!: string;

  @Expose()
  description!: string;

  @Expose()
  dueDate!: Date;

  @Expose()
  attachments!: number[];
}

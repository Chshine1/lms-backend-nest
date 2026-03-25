import { Expose } from 'class-transformer';
import { BaseEntityContract } from '../../base-entity.contract';

export enum ClassroomStatus {
  AVAILABLE = 1,
  MAINTENANCE = 2,
  RESERVED = 3,
}

export class ClassroomContract extends BaseEntityContract {
  @Expose()
  campusId!: number;

  @Expose()
  name!: string;

  @Expose()
  capacity!: number;

  @Expose()
  specification!: string;

  @Expose()
  equipment!: string;

  @Expose()
  status!: ClassroomStatus;

  @Expose()
  remarks?: string;
}

import { Expose } from 'class-transformer';

export class StudentContract {
  @Expose()
  userId!: number;

  @Expose()
  studentNo!: string;

  @Expose()
  grade!: number;

  @Expose()
  school!: string;

  @Expose()
  targetScore!: string;

  @Expose()
  estimatedExamDate!: Date;

  @Expose()
  vipLevel!: string;

  @Expose()
  responsibleAdvisorId!: number;

  @Expose()
  responsibleConsultantId!: number;

  @Expose()
  campusId!: number;

  @Expose()
  parentIds!: number[];
}

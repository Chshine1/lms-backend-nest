import { Expose } from 'class-transformer';
import { BaseEntityContract } from '../../base-entity.contract';

export enum MaterialVisibility {
  TEACHER_ONLY = 1,
  STUDENT_ONLY = 2,
  PARENT_VISIBLE = 3,
}

export class CourseMaterialContract extends BaseEntityContract {
  @Expose()
  courseId!: number;

  @Expose()
  title!: string;

  @Expose()
  description!: string;

  @Expose()
  fileUrl!: string;

  @Expose()
  fileType!: string;

  @Expose()
  fileSize!: number;

  @Expose()
  visibility!: MaterialVisibility;

  @Expose()
  allowDownload!: boolean;

  @Expose()
  uploaderId!: string;
}

import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  VersionColumn,
} from 'typeorm';
import { CourseMaterialContract, MaterialVisibility } from '@app/contracts';

@Entity('course_materials')
export class CourseMaterial implements CourseMaterialContract {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'course_id' })
  courseId!: number;

  @Column()
  title!: string;

  @Column({ type: 'text' })
  description!: string;

  @Column({ name: 'file_url' })
  fileUrl!: string;

  @Column({ name: 'file_type' })
  fileType!: string;

  @Column({ name: 'file_size' })
  fileSize!: number;

  @Column({
    type: 'smallint',
    default: MaterialVisibility.TEACHER_ONLY,
  })
  visibility!: MaterialVisibility;

  @Column({ name: 'allow_download', default: false })
  allowDownload!: boolean;

  @Column({ default: 1 })
  version!: number;

  @Column({ name: 'uploader_id' })
  uploaderId!: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt?: Date;

  @VersionColumn()
  entityVersion!: number;
}

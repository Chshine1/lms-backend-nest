import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  VersionColumn,
} from 'typeorm';
import { CourseVideoContract } from '@app/contracts/course/entities/course-video.contract';

@Entity('course_videos')
export class CourseVideo implements CourseVideoContract {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'course_id' })
  courseId!: number;

  @Column({ name: 'chapter_name' })
  chapterName!: string;

  @Column({ name: 'video_url' })
  videoUrl!: string;

  @Column({ name: 'unlock_condition', type: 'text', nullable: true })
  unlockCondition!: string;

  @Column({ name: 'validity_period', type: 'date', nullable: true })
  validityPeriod!: Date;

  @Column({ name: 'enable_drm', default: false })
  enableDrm!: boolean;

  @Column({ name: 'sort_order' })
  sortOrder!: number;

  @Column({ name: 'uploader_id' })
  uploaderId!: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt?: Date;

  @VersionColumn()
  version!: number;
}

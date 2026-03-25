import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  VersionColumn,
} from 'typeorm';
import { ReviewContract } from '@app/contracts/assignment/entities/review.contract';

@Entity('reviews')
@Index('IDX_review_submission', ['submissionId'], { unique: true })
export class Review implements ReviewContract {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'submission_id' })
  submissionId!: number;

  @Column({ name: 'teacher_id' })
  teacherId!: number;

  @Column({ type: 'smallint' })
  score!: number;

  @Column({ type: 'text' })
  feedback!: string;

  @Column({ name: 'reviewed_at', type: 'timestamp' })
  reviewedAt!: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt?: Date;

  @VersionColumn()
  version!: number;

  @OneToOne('Submission', 'review')
  submission!: never;
}

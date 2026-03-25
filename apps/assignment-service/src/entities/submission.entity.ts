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
import { SubmissionStatus } from '@app/contracts/assignment/entities/submission-status.enum';
import { FileReference } from '@app/contracts/assignment/entities/file-reference.value';
import { SubmissionContract } from '@app/contracts/assignment/entities/submission.contract';

@Entity('submissions')
@Index('IDX_submission_enrollment_assignment', ['enrollmentId', 'assignmentId'])
@Index('IDX_submission_status', ['status'])
export class Submission implements SubmissionContract {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'enrollment_id' })
  enrollmentId!: number;

  @Column({ name: 'assignment_id' })
  assignmentId!: number;

  @Column({ type: 'text', nullable: true })
  submissionText?: string;

  @Column({ type: 'jsonb', nullable: true })
  attachments?: FileReference[];

  @Column({ name: 'submitted_at', type: 'timestamp', nullable: true })
  submittedAt?: Date;

  @Column({
    type: 'varchar',
    default: SubmissionStatus.DRAFT,
  })
  status!: SubmissionStatus;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt?: Date;

  @VersionColumn()
  version!: number;

  @OneToOne('Review', 'submission')
  review?: unknown;
}

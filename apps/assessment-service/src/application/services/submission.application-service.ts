import { Injectable } from '@nestjs/common';
import type {
  IAssignmentRepository,
  ISubmissionRepository,
} from '../../domain/repositories/index';
import { Submission } from '../../domain/entities/submission.entity';
import { SubmissionCreatedEvent } from '../../domain/events/domain.events';

export class SubmissionDataDto {
  content!: string;
  files!: { fileKey: string; fileName: string }[];
}

export class SubmissionDto {
  id!: bigint;
  studentId!: bigint;
  assignmentId!: bigint;
  content!: string;
  submissionCount!: number;
  submittedAt!: Date;
}

@Injectable()
export class SubmissionApplicationService {
  constructor(
    private readonly submissionRepository: ISubmissionRepository,
    private readonly assignmentRepository: IAssignmentRepository,
  ) {}

  async submit(
    studentId: bigint,
    assignmentId: bigint,
    data: SubmissionDataDto,
  ): Promise<SubmissionDto> {
    const assignment = await this.assignmentRepository.findById(assignmentId);
    if (!assignment) {
      throw new Error(`Assignment ${String(assignmentId)} not found`);
    }

    let submission = await this.submissionRepository.findByStudentAndAssignment(
      studentId,
      assignmentId,
    );

    const isNew = !submission;
    if (isNew) {
      submission = new Submission();
      submission.studentId = studentId;
      submission.assignmentId = assignmentId;
      submission.content = data.content;
      submission.files = data.files;
      submission.submissionCount = 1;
      submission.submittedAt = new Date();
    } else {
      submission.updateContent(data.content, data.files, {
        dueTime: assignment.dueTime,
        allowedResubmissions: assignment.allowedResubmissions,
      });
    }

    await this.submissionRepository.save(submission);

    if (isNew) {
      const event = new SubmissionCreatedEvent(
        submission.id,
        submission.studentId,
        submission.assignmentId,
      );
      console.log('Event:', event);
    }

    return this.mapToDto(submission);
  }

  private mapToDto(submission: Submission): SubmissionDto {
    const dto = new SubmissionDto();
    dto.id = submission.id;
    dto.studentId = submission.studentId;
    dto.assignmentId = submission.assignmentId;
    dto.content = submission.content;
    dto.submissionCount = submission.submissionCount;
    dto.submittedAt = submission.submittedAt;
    return dto;
  }
}

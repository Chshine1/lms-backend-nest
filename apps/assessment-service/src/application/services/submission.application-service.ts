import { Inject, Injectable } from '@nestjs/common';
import type {
  ISubmissionRepository,
  IAssignmentRepository,
} from '../../domain/repositories/index';
import { SubmissionRepository, AssignmentRepository } from '../../infrastructure/repositories/index';
import { Submission } from '../../domain/entities/submission.entity';
import { SubmissionCreatedEvent } from '../../domain/events/domain.events';
import { SubmissionDataDto, SubmissionDto } from '@app/contracts';
import { EventBusService } from '@app/event-bus';

@Injectable()
export class SubmissionApplicationService {
  constructor(
    @Inject(SubmissionRepository)
    private readonly submissionRepository: ISubmissionRepository,
    @Inject(AssignmentRepository)
    private readonly assignmentRepository: IAssignmentRepository,
    private readonly eventBus: EventBusService,
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

    const isNew = submission === null;
    if (submission === null) {
      submission = new Submission();
      submission.studentId = studentId;
      submission.assignmentId = assignmentId;
      submission.content = data.content;
      submission.submissionCount = 1;
      submission.submittedAt = new Date();
    } else {
      submission.updateContent(data.content, {
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
      await this.eventBus.publish(event);
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

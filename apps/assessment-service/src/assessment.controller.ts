import { Controller } from '@nestjs/common';
import { RabbitRPC } from '@golevelup/nestjs-rabbitmq';
import { AssessmentTypedClient, ExtractController } from '@app/typed-client';
import { GradeDto, ReviewDto, SubmissionDto } from '@app/contracts';
import { SubmissionApplicationService } from './application/services/submission.application-service';
import { ReviewApplicationService } from './application/services/review.application-service';

@Controller()
export class AssessmentController implements ExtractController<AssessmentTypedClient> {
  constructor(
    private readonly submissionApplicationService: SubmissionApplicationService,
    private readonly reviewApplicationService: ReviewApplicationService,
  ) {}

  @RabbitRPC({
    exchange: 'assessment-service',
    routingKey: 'submission.submit',
    queue: 'assessment-service-submission-submit',
    queueOptions: {
      durable: true,
      autoDelete: false,
    },
  })
  async submit(data: {
    studentId: bigint;
    assignmentId: bigint;
    data: {
      content: string;
      files: { fileKey: string; fileName: string }[];
    };
  }): Promise<SubmissionDto> {
    return this.submissionApplicationService.submit(
      data.studentId,
      data.assignmentId,
      data.data,
    );
  }

  @RabbitRPC({
    exchange: 'assessment-service',
    routingKey: 'submission.grade',
    queue: 'assessment-service-submission-grade',
    queueOptions: {
      durable: true,
      autoDelete: false,
    },
  })
  async gradeSubmission(data: {
    submissionId: bigint;
    reviewerId: bigint;
    data: GradeDto;
  }): Promise<ReviewDto> {
    return this.reviewApplicationService.gradeSubmission(
      data.submissionId,
      data.reviewerId,
      data.data,
    );
  }

  @RabbitRPC({
    exchange: 'assessment-service',
    routingKey: 'assignment.find-by-id',
    queue: 'assessment-service-assignment-find-by-id',
    queueOptions: {
      durable: true,
      autoDelete: false,
    },
  })
  findAssignmentById(_data: { assignmentId: bigint }): Promise<{
    id: bigint;
    unitId: bigint;
    title: string;
    type: string;
    content: Record<string, unknown>;
    dueTime: Date;
    allowedResubmissions: number;
    totalGrade: number;
  } | null> {
    throw new Error('Not implemented');
  }

  @RabbitRPC({
    exchange: 'assessment-service',
    routingKey: 'submission.find-by-id',
    queue: 'assessment-service-submission-find-by-id',
    queueOptions: {
      durable: true,
      autoDelete: false,
    },
  })
  findSubmissionById(_data: {
    submissionId: bigint;
  }): Promise<SubmissionDto | null> {
    throw new Error('Not implemented');
  }
}

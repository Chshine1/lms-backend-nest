import { Controller } from '@nestjs/common';
import { RabbitRPC } from '@golevelup/nestjs-rabbitmq';
import { AssignmentService } from './assignment.service';
import {
  CreateReviewDto,
  ReviewContract,
  SubmissionContract,
  UpdateReviewDto,
  UpdateSubmissionDto,
} from '@app/contracts';
import { AssignmentTypedClient, ExtractController } from '@app/typed-client';

@Controller()
export class AssignmentController implements ExtractController<AssignmentTypedClient> {
  constructor(private readonly assignmentService: AssignmentService) {}

  @RabbitRPC({
    exchange: 'assignment-service',
    routingKey: 'assignment.createSubmission',
    queue: 'assignment-service-assignment-createSubmission',
  })
  createSubmission(dto: unknown): Promise<SubmissionContract> {
    return this.assignmentService.createSubmission(dto as never);
  }

  @RabbitRPC({
    exchange: 'assignment-service',
    routingKey: 'assignment.updateSubmission',
    queue: 'assignment-service-assignment-updateSubmission',
  })
  updateSubmission(
    data: { id: number } & UpdateSubmissionDto,
  ): Promise<SubmissionContract> {
    return this.assignmentService.updateSubmission(data.id, data);
  }

  @RabbitRPC({
    exchange: 'assignment-service',
    routingKey: 'assignment.submitAssignment',
    queue: 'assignment-service-assignment-submitAssignment',
  })
  submitAssignment(data: { id: number }): Promise<SubmissionContract> {
    return this.assignmentService.submitAssignment(data.id);
  }

  @RabbitRPC({
    exchange: 'assignment-service',
    routingKey: 'assignment.getSubmissionByEnrollmentAndAssignment',
    queue:
      'assignment-service-assignment-getSubmissionByEnrollmentAndAssignment',
  })
  getSubmissionByEnrollmentAndAssignment(data: {
    enrollmentId: number;
    assignmentId: number;
  }): Promise<SubmissionContract | null> {
    return this.assignmentService.getSubmissionByEnrollmentAndAssignment(
      data.enrollmentId,
      data.assignmentId,
    );
  }

  @RabbitRPC({
    exchange: 'assignment-service',
    routingKey: 'assignment.getSubmissionsByAssignment',
    queue: 'assignment-service-assignment-getSubmissionsByAssignment',
  })
  getSubmissionsByAssignment(data: {
    assignmentId: number;
  }): Promise<SubmissionContract[]> {
    return this.assignmentService.getSubmissionsByAssignment(data.assignmentId);
  }

  @RabbitRPC({
    exchange: 'assignment-service',
    routingKey: 'assignment.createReview',
    queue: 'assignment-service-assignment-createReview',
  })
  createReview(
    data: { submissionId: number } & CreateReviewDto,
  ): Promise<ReviewContract> {
    return this.assignmentService.createReview(data.submissionId, data);
  }

  @RabbitRPC({
    exchange: 'assignment-service',
    routingKey: 'assignment.updateReview',
    queue: 'assignment-service-assignment-updateReview',
  })
  updateReview(
    data: { submissionId: number } & UpdateReviewDto,
  ): Promise<ReviewContract> {
    return this.assignmentService.updateReview(data.submissionId, data);
  }

  @RabbitRPC({
    exchange: 'assignment-service',
    routingKey: 'assignment.getReviewBySubmission',
    queue: 'assignment-service-assignment-getReviewBySubmission',
  })
  getReviewBySubmission(data: {
    submissionId: number;
  }): Promise<ReviewContract | null> {
    return this.assignmentService.getReviewBySubmission(data.submissionId);
  }
}

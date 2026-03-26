import { Inject, Injectable } from '@nestjs/common';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { TypedClientBase } from '../typed-client.base';
import {
  CreateReviewDto,
  CreateSubmissionDto,
  ReviewContract,
  SubmissionContract,
  UpdateReviewDto,
  UpdateSubmissionDto,
} from '@app/contracts';
import {
  TYPED_CLIENT_MQ_OPTIONS,
  type TypedClientMqOptions,
} from '../typed-client.module';
import { AssignmentPatterns } from '../patterns/assignment.patterns';
import { TraceService } from '@app/trace';

@Injectable()
export class AssignmentTypedClient extends TypedClientBase<AssignmentPatterns> {
  constructor(
    amqpConnection: AmqpConnection,
    traceService: TraceService,
    @Inject(TYPED_CLIENT_MQ_OPTIONS)
    options: TypedClientMqOptions,
  ) {
    super(amqpConnection, traceService, options);
  }

  createSubmission(data: CreateSubmissionDto): Promise<SubmissionContract> {
    return this.rpc('assignment.createSubmission', data);
  }

  updateSubmission(
    data: { id: number } & UpdateSubmissionDto,
  ): Promise<SubmissionContract> {
    return this.rpc('assignment.updateSubmission', data);
  }

  submitAssignment(data: { id: number }): Promise<SubmissionContract> {
    return this.rpc('assignment.submitAssignment', data);
  }

  getSubmissionByEnrollmentAndAssignment(data: {
    enrollmentId: number;
    assignmentId: number;
  }): Promise<SubmissionContract | null> {
    return this.rpc('assignment.getSubmissionByEnrollmentAndAssignment', data);
  }

  getSubmissionsByAssignment(data: {
    assignmentId: number;
  }): Promise<SubmissionContract[]> {
    return this.rpc('assignment.getSubmissionsByAssignment', data);
  }

  createReview(
    data: { submissionId: number } & CreateReviewDto,
  ): Promise<ReviewContract> {
    return this.rpc('assignment.createReview', data);
  }

  updateReview(
    data: { submissionId: number } & UpdateReviewDto,
  ): Promise<ReviewContract> {
    return this.rpc('assignment.updateReview', data);
  }

  getReviewBySubmission(data: {
    submissionId: number;
  }): Promise<ReviewContract | null> {
    return this.rpc('assignment.getReviewBySubmission', data);
  }
}

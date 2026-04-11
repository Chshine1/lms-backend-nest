import { Injectable } from '@nestjs/common';
import { TypedClientBase } from '../typed-client.base';
import {
  CreateReviewDto,
  CreateSubmissionDto,
  ReviewContract,
  SubmissionContract,
  UpdateReviewDto,
  UpdateSubmissionDto,
} from '@app/contracts';
import { AssignmentPatterns } from '../patterns/assignment.patterns';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { UserContextService } from '@app/authentication';

@Injectable()
export class AssignmentTypedClient extends TypedClientBase<AssignmentPatterns> {
  constructor(
    amqpConnection: AmqpConnection,
    userContextService: UserContextService,
    options: {
      exchange: string;
    },
  ) {
    super('assignment-service', amqpConnection, userContextService, options);
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

import { Inject, Injectable } from '@nestjs/common';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { TypedClientBase } from '@app/typed-client/typed-client.base';
import { SubmissionContract } from '@app/contracts/assignment/entities/submission.contract';
import { ReviewContract } from '@app/contracts/assignment/entities/review.contract';
import { CreateSubmissionDto } from '@app/contracts/assignment/dto/create-submission.dto';
import { UpdateSubmissionDto } from '@app/contracts/assignment/dto/update-submission.dto';
import { CreateReviewDto } from '@app/contracts/assignment/dto/create-review.dto';
import { UpdateReviewDto } from '@app/contracts/assignment/dto/update-review.dto';
import {
  TYPED_CLIENT_MQ_OPTIONS,
  type TypedClientMqOptions,
} from '@app/typed-client/typed-client.module';
import { AssignmentPatterns } from '@app/typed-client/patterns/assignment.patterns';

@Injectable()
export class AssignmentTypedClient extends TypedClientBase<AssignmentPatterns> {
  constructor(
    amqpConnection: AmqpConnection,
    @Inject(TYPED_CLIENT_MQ_OPTIONS)
    options: TypedClientMqOptions,
  ) {
    super(amqpConnection, options);
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

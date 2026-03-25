import { SubmissionContract } from '@app/contracts/assignment/entities/submission.contract';
import { ReviewContract } from '@app/contracts/assignment/entities/review.contract';
import { CreateSubmissionDto } from '@app/contracts/assignment/dto/create-submission.dto';
import { UpdateSubmissionDto } from '@app/contracts/assignment/dto/update-submission.dto';
import { CreateReviewDto } from '@app/contracts/assignment/dto/create-review.dto';
import { UpdateReviewDto } from '@app/contracts/assignment/dto/update-review.dto';

export interface AssignmentPatterns extends Record<
  string,
  { request: unknown; response: unknown }
> {
  'assignment.createSubmission': {
    request: CreateSubmissionDto;
    response: SubmissionContract;
  };
  'assignment.updateSubmission': {
    request: { id: number } & UpdateSubmissionDto;
    response: SubmissionContract;
  };
  'assignment.submitAssignment': {
    request: { id: number };
    response: SubmissionContract;
  };
  'assignment.getSubmissionByEnrollmentAndAssignment': {
    request: { enrollmentId: number; assignmentId: number };
    response: SubmissionContract | null;
  };
  'assignment.getSubmissionsByAssignment': {
    request: { assignmentId: number };
    response: SubmissionContract[];
  };
  'assignment.createReview': {
    request: { submissionId: number } & CreateReviewDto;
    response: ReviewContract;
  };
  'assignment.updateReview': {
    request: { submissionId: number } & UpdateReviewDto;
    response: ReviewContract;
  };
  'assignment.getReviewBySubmission': {
    request: { submissionId: number };
    response: ReviewContract | null;
  };
}

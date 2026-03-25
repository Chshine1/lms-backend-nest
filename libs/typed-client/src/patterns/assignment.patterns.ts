import {
  CreateReviewDto,
  CreateSubmissionDto,
  ReviewContract,
  SubmissionContract,
  UpdateReviewDto,
  UpdateSubmissionDto,
} from '@app/contracts';

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

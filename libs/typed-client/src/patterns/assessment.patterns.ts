import { SubmissionDto, GradeDto, ReviewDto } from '@app/contracts';

export interface AssessmentPatterns extends Record<
  string,
  { request: unknown; response: unknown }
> {
  'submission.submit': {
    request: {
      studentId: bigint;
      assignmentId: bigint;
      data: {
        content: string;
        files: { fileKey: string; fileName: string }[];
      };
    };
    response: SubmissionDto;
  };
  'submission.grade': {
    request: {
      submissionId: bigint;
      reviewerId: bigint;
      data: GradeDto;
    };
    response: ReviewDto;
  };
}

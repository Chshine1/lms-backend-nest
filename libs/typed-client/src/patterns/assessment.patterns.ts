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
  'assignment.find-by-id': {
    request: {
      assignmentId: bigint;
    };
    response: {
      id: bigint;
      unitId: bigint;
      title: string;
      type: string;
      content: Record<string, unknown>;
      dueTime: Date;
      allowedResubmissions: number;
      totalGrade: number;
    } | null;
  };
  'submission.find-by-id': {
    request: {
      submissionId: bigint;
    };
    response: SubmissionDto | null;
  };
}

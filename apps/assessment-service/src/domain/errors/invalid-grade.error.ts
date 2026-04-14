import { BaseError } from '@app/contracts';
import { AssessmentErrorCode } from '@/assessment-service/src/domain/error.codes';

export class InvalidGradeError extends BaseError<{
  grade: number;
  totalGrade: number;
}> {
  constructor(grade: number, totalGrade: number) {
    super(
      `Invalid grade ${String(grade)}. Must be between 0 and ${String(totalGrade)}`,
      AssessmentErrorCode.INVALID_GRADE,
      { grade, totalGrade },
    );
  }
}

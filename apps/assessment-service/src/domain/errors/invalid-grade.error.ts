import { BaseError } from '@app/contracts';
import { ErrorCode } from '@app/contracts';

export class InvalidGradeError extends BaseError<{
  grade: number;
  totalGrade: number;
}> {
  constructor(grade: number, totalGrade: number) {
    super(
      `Invalid grade ${String(grade)}. Must be between 0 and ${String(totalGrade)}`,
      ErrorCode.INVALID_SCORE,
      { grade, totalGrade },
    );
  }
}

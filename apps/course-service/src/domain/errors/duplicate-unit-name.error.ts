import { BaseError } from '@app/contracts';
import { CourseErrorCode } from '@/course-service/src/domain/error.codes';

export class DuplicateUnitNameError extends BaseError<{ unitName: string }> {
  constructor(unitName: string) {
    super(
      `Unit with name "${unitName}" already exists in this course`,
      CourseErrorCode.DUPLICATE_UNIT_NAME,
      { unitName },
    );
  }
}

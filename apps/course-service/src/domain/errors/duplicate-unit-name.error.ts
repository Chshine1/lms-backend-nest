import { BaseError } from '@app/contracts';
import { ErrorCode } from '@app/contracts';

export class DuplicateUnitNameError extends BaseError<{ unitName: string }> {
  constructor(unitName: string) {
    super(
      `Unit with name "${unitName}" already exists in this course`,
      ErrorCode.BAD_REQUEST,
      { unitName },
    );
  }
}

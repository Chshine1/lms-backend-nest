import { BaseError } from './base-error';
import { ErrorCode } from './error.codes';

interface Issue {
  path: string;
  message: string;
}

export class BadRequestError extends BaseError<{
  issues: Issue[];
}> {
  constructor(issues: Issue[]) {
    super('Request validation failed', ErrorCode.BAD_REQUEST, {
      issues,
    });
  }
}

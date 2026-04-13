import { BaseError } from '@app/contracts';
import { UserErrorCode } from '@/user-service/src/domain/error.codes';

export class OnboardingAlreadyCompletedError extends BaseError<{
  studentUserId: bigint;
}> {
  constructor(studentUserId: bigint) {
    super(
      `Onboarding already completed for student user ID: ${String(studentUserId)}`,
      UserErrorCode.ONBOARDING_ALREADY_COMPLETED,
      {
        studentUserId,
      },
    );
  }
}

import { defineEntity, p } from '@mikro-orm/core';
import { OnboardingStatus } from '../enums/onboarding-status.enum';
import { StudentOnboardingCompleted } from '../events/domain.events';
import { BaseEntitySchema } from '@app/contracts';
import { OnboardingAlreadyCompletedError } from '../errors/index';

const StudentProfileSchema = defineEntity({
  name: 'StudentProfile',
  extends: BaseEntitySchema,
  tableName: 'student_profiles',
  properties: {
    userId: p.bigint().unique(),
    onboardingStatus: p
      .enum(() => OnboardingStatus)
      .nativeEnumName('onboarding_status'),
    onboardingCompletedAt: p.datetime().nullable(),
  },
});

export class StudentProfile extends StudentProfileSchema.class {
  constructor(userId: bigint) {
    super();
    this.userId = userId;
    this.onboardingStatus = OnboardingStatus.NOT_STARTED;
  }

  startOnboarding(): void {
    this.onboardingStatus = OnboardingStatus.IN_PROGRESS;
  }

  completeOnboarding(): StudentOnboardingCompleted {
    if (this.onboardingStatus === OnboardingStatus.COMPLETED) {
      throw new OnboardingAlreadyCompletedError(this.userId);
    }

    this.onboardingStatus = OnboardingStatus.COMPLETED;
    this.onboardingCompletedAt = new Date();

    return new StudentOnboardingCompleted(
      this.userId,
      this.onboardingCompletedAt,
    );
  }
}

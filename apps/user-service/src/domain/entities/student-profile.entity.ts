import { Entity, Enum, Property } from '@mikro-orm/core';
import { BaseEntityV2 } from '../shared/base-entity-v2';
import { OnboardingStatus } from '../enums/onboarding-status.enum';
import { OnboardingAlreadyCompletedException } from '../exceptions/domain.exceptions';
import { StudentOnboardingCompleted } from '../events/domain.events';

@Entity({ tableName: 'student_profiles' })
export class StudentProfile extends BaseEntityV2 {
  @Property({ fieldName: 'user_id', type: 'bigint', unique: true })
  userId!: number;

  @Enum({
    fieldName: 'onboarding_status',
    items: () => OnboardingStatus,
    type: 'varchar',
    length: 30,
  })
  onboardingStatus!: OnboardingStatus;

  @Property({
    fieldName: 'onboarding_completed_at',
    type: 'timestamp',
    nullable: true,
  })
  onboardingCompletedAt?: Date;

  constructor(userId: number) {
    super();
    this.userId = userId;
    this.onboardingStatus = OnboardingStatus.NOT_STARTED;
  }

  startOnboarding(): void {
    this.onboardingStatus = OnboardingStatus.IN_PROGRESS;
  }

  completeOnboarding(): StudentOnboardingCompleted {
    if (this.onboardingStatus === OnboardingStatus.COMPLETED) {
      throw new OnboardingAlreadyCompletedException(this.userId);
    }

    this.onboardingStatus = OnboardingStatus.COMPLETED;
    this.onboardingCompletedAt = new Date();

    return new StudentOnboardingCompleted(
      this.userId,
      this.onboardingCompletedAt,
    );
  }
}

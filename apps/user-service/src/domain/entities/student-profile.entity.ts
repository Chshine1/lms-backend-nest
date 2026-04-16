import { defineEntity, p } from '@mikro-orm/core';
import { OnboardingStatus } from '../enums/onboarding-status.enum';
import { StudentOnboardingCompleted } from '../events/domain.events';
import { AggregateRootSchema } from '@app/contracts';
import type { DomainEvent } from '@app/event-bus';
import { OnboardingAlreadyCompletedError } from '../errors/index';

const StudentProfileSchema = defineEntity({
  name: 'StudentProfile',
  extends: AggregateRootSchema,
  tableName: 'student_profiles',
  properties: {
    userId: p.bigint().unique(),
    onboardingStatus: p
      .enum(() => OnboardingStatus)
      .nativeEnumName('onboarding_status'),
  },
});

export class StudentProfile extends StudentProfileSchema.class {
  private _domainEvents: DomainEvent[] = [];

  constructor(userId: bigint) {
    super();
    this.userId = userId;
    this.onboardingStatus = OnboardingStatus.NOT_STARTED;
  }

  completeOnboarding(): StudentOnboardingCompleted {
    if (this.onboardingStatus === OnboardingStatus.COMPLETED) {
      throw new OnboardingAlreadyCompletedError(this.userId);
    }

    this.onboardingStatus = OnboardingStatus.COMPLETED;
    const event = new StudentOnboardingCompleted(this.userId, new Date());
    this.addEvent(event);
    return event;
  }

  getDomainEvents(): DomainEvent[] {
    return [...this._domainEvents];
  }

  clearDomainEvents(): void {
    this._domainEvents = [];
  }

  protected addEvent(event: DomainEvent): void {
    this._domainEvents.push(event);
  }
}

StudentProfileSchema.setClass(StudentProfile);

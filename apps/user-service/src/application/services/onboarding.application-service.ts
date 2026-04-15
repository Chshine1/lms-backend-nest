import { Injectable } from '@nestjs/common';
import type { IStudentProfileRepository } from '../../domain/repositories/index';
import { UserNotFoundError } from '../../domain/errors/index';
import { CompleteOnboardingDto } from '@app/contracts';
import { EventBusService } from '@app/event-bus';

@Injectable()
export class OnboardingApplicationService {
  constructor(
    private readonly studentProfileRepository: IStudentProfileRepository,
    private readonly eventBus: EventBusService,
  ) {}

  async confirmStudentOnboarding(dto: CompleteOnboardingDto): Promise<void> {
    const profile = await this.studentProfileRepository.findByUserId(
      dto.studentUserId,
    );
    if (!profile) {
      throw new UserNotFoundError(dto.studentUserId);
    }

    const event = profile.completeOnboarding();

    await this.studentProfileRepository.save(profile);

    await this.eventBus.publish(event);
  }
}

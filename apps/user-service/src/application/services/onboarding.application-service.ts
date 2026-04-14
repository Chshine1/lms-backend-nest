import { Injectable } from '@nestjs/common';
import type { IStudentProfileRepository } from '../../domain/repositories/index';
import { UserNotFoundError } from '../../domain/errors/index';
import { CompleteOnboardingDto } from '@app/contracts';

@Injectable()
export class OnboardingApplicationService {
  constructor(
    private readonly studentProfileRepository: IStudentProfileRepository,
  ) {}

  async confirmStudentOnboarding(dto: CompleteOnboardingDto): Promise<void> {
    // Find student profile
    const profile = await this.studentProfileRepository.findByUserId(
      dto.studentUserId,
    );
    if (!profile) {
      throw new UserNotFoundError(dto.studentUserId);
    }

    // TODO: Verify signature if needed using SignatureVerificationService
    // For now, we'll skip signature verification

    // Complete onboarding
    const event = profile.completeOnboarding();

    // Save profile
    await this.studentProfileRepository.save(profile);

    // TODO: Publish event to event bus
    console.log('Event:', event);
  }
}

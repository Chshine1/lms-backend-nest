import { Injectable } from '@nestjs/common';
import { IStudentProfileRepository } from '@/user-service/src/domain/repositories/student-profile.repository.interface';
import { CompleteOnboardingDto } from '../dtos/complete-onboarding.dto';
import { UserNotFoundException } from '@/user-service/src/domain/exceptions/domain.exceptions';

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
      throw new UserNotFoundException(dto.studentUserId);
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

import { Injectable } from '@nestjs/common';
import { IParentStudentLinkRepository } from '@/user-service/src/domain/repositories/parent-student-link.repository.interface';
import { ParentStudentLinkingService } from '@/user-service/src/domain/services/parent-student-linking.service';
import { LinkParentStudentDto } from '../dtos/link-parent-student.dto';
import { ParentLinkedToStudent } from '@/user-service/src/domain/events/domain.events';

@Injectable()
export class LinkingApplicationService {
  constructor(
    private readonly parentStudentLinkRepository: IParentStudentLinkRepository,
    private readonly parentStudentLinkingService: ParentStudentLinkingService,
  ) {}

  async linkParentToStudent(dto: LinkParentStudentDto): Promise<void> {
    // Validate and create link
    const link = await this.parentStudentLinkingService.validateAndLink(
      dto.parentUserId,
      dto.studentUserId,
    );

    // Save link
    await this.parentStudentLinkRepository.save(link);

    // Publish event
    const event = new ParentLinkedToStudent(
      dto.parentUserId,
      dto.studentUserId,
      link.createdAt,
    );
    // TODO: Publish event to event bus
    console.log('Event:', event);
  }
}

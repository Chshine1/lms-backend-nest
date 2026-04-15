import { Injectable } from '@nestjs/common';
import type { IParentStudentLinkRepository } from '../../domain/repositories/index';
import { ParentStudentLinkingService } from '@/user-service/src/domain/services/parent-student-linking.service';
import { ParentLinkedToStudent } from '../../domain/events/domain.events';
import { LinkParentStudentDto } from '@app/contracts';
import { EventBusService } from '@app/event-bus';

@Injectable()
export class LinkingApplicationService {
  constructor(
    private readonly parentStudentLinkRepository: IParentStudentLinkRepository,
    private readonly parentStudentLinkingService: ParentStudentLinkingService,
    private readonly eventBus: EventBusService,
  ) {}

  async linkParentToStudent(dto: LinkParentStudentDto): Promise<void> {
    const link = await this.parentStudentLinkingService.validateAndLink(
      dto.parentUserId,
      dto.studentUserId,
    );

    await this.parentStudentLinkRepository.save(link);

    const event = new ParentLinkedToStudent(
      dto.parentUserId,
      dto.studentUserId,
      link.createdAt,
    );
    await this.eventBus.publish(event);
  }
}

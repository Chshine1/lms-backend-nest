import { Inject, Injectable } from '@nestjs/common';
import type { IAssignmentRepository } from '../../domain/repositories/index';
import { AssignmentRepository } from '../../infrastructure/repositories/index';

@Injectable()
export class AssignmentApplicationService {
  constructor(
    @Inject(AssignmentRepository)
    private readonly assignmentRepository: IAssignmentRepository,
  ) {}

  async findById(assignmentId: bigint): Promise<{
    id: bigint;
    unitId: bigint;
    title: string;
    type: string;
    content: Record<string, unknown>;
    dueTime: Date;
    allowedResubmissions: number;
    totalGrade: number;
  } | null> {
    const assignment = await this.assignmentRepository.findById(assignmentId);
    if (!assignment) {
      return null;
    }

    return {
      id: assignment.id,
      unitId: assignment.unitId,
      title: assignment.title,
      type: assignment.type,
      content: assignment.content as Record<string, unknown>,
      dueTime: assignment.dueTime,
      allowedResubmissions: assignment.allowedResubmissions,
      totalGrade: assignment.totalGrade,
    };
  }
}

import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { AssessmentTypedClient } from '@app/typed-client';
import {
  SubmissionDataDto,
  SubmissionDto,
  GradeDto,
  ReviewDto,
} from '@app/contracts';

@Controller('assignments')
export class AssessmentController {
  constructor(private readonly assessmentClient: AssessmentTypedClient) {}

  @Get(':id')
  async getAssignment(@Param('id') id: string): Promise<{
    id: bigint;
    unitId: bigint;
    title: string;
    type: string;
    content: Record<string, unknown>;
    dueTime: Date;
    allowedResubmissions: number;
    totalGrade: number;
  } | null> {
    return await this.assessmentClient.findAssignmentById({
      assignmentId: BigInt(id),
    });
  }

  @Post('submissions')
  async submit(
    @Body()
    body: {
      studentId: bigint;
      assignmentId: bigint;
      data: SubmissionDataDto;
    },
  ): Promise<SubmissionDto> {
    return await this.assessmentClient.submit({
      studentId: body.studentId,
      assignmentId: body.assignmentId,
      data: body.data,
    });
  }

  @Get('submissions/:submissionId')
  async getSubmission(
    @Param('submissionId') submissionId: string,
  ): Promise<SubmissionDto | null> {
    return await this.assessmentClient.findSubmissionById({
      submissionId: BigInt(submissionId),
    });
  }

  @Post('submissions/:submissionId/grade')
  async gradeSubmission(
    @Param('submissionId') submissionId: string,
    @Body() body: { reviewerId: bigint; data: GradeDto },
  ): Promise<ReviewDto> {
    return await this.assessmentClient.gradeSubmission({
      submissionId: BigInt(submissionId),
      reviewerId: body.reviewerId,
      data: body.data,
    });
  }
}

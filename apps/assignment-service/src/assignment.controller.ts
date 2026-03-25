import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { AssignmentService } from './assignment.service';
import { CreateSubmissionDto } from '@app/contracts/assignment/dto/create-submission.dto';
import { UpdateSubmissionDto } from '@app/contracts/assignment/dto/update-submission.dto';
import { CreateReviewDto } from '@app/contracts/assignment/dto/create-review.dto';
import { UpdateReviewDto } from '@app/contracts/assignment/dto/update-review.dto';
import { Submission } from './entities/submission.entity';
import { Review } from './entities/review.entity';

@Controller()
export class AssignmentController {
  constructor(private readonly assignmentService: AssignmentService) {}

  @Post('submissions')
  async createSubmission(
    @Body() dto: CreateSubmissionDto,
  ): Promise<Submission> {
    return this.assignmentService.createSubmission(dto);
  }

  @Put('submissions/:id')
  async updateSubmission(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateSubmissionDto,
  ): Promise<Submission> {
    return this.assignmentService.updateSubmission(id, dto);
  }

  @Post('submissions/:id/submit')
  async submitAssignment(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<Submission> {
    return this.assignmentService.submitAssignment(id);
  }

  @Get('enrollments/:enrollmentId/assignments/:assignmentId/submission')
  async getSubmissionByEnrollmentAndAssignment(
    @Param('enrollmentId', ParseIntPipe) enrollmentId: number,
    @Param('assignmentId', ParseIntPipe) assignmentId: number,
  ): Promise<Submission | null> {
    return this.assignmentService.getSubmissionByEnrollmentAndAssignment(
      enrollmentId,
      assignmentId,
    );
  }

  @Get('assignments/:assignmentId/submissions')
  async getSubmissionsByAssignment(
    @Param('assignmentId', ParseIntPipe) assignmentId: number,
  ): Promise<Submission[]> {
    return this.assignmentService.getSubmissionsByAssignment(assignmentId);
  }

  @Post('submissions/:submissionId/review')
  async createReview(
    @Param('submissionId', ParseIntPipe) submissionId: number,
    @Body() dto: CreateReviewDto,
  ): Promise<Review> {
    return this.assignmentService.createReview(submissionId, dto);
  }

  @Put('submissions/:submissionId/review')
  async updateReview(
    @Param('submissionId', ParseIntPipe) submissionId: number,
    @Body() dto: UpdateReviewDto,
  ): Promise<Review> {
    return this.assignmentService.updateReview(submissionId, dto);
  }

  @Get('submissions/:submissionId/review')
  async getReviewBySubmission(
    @Param('submissionId', ParseIntPipe) submissionId: number,
  ): Promise<Review | null> {
    return this.assignmentService.getReviewBySubmission(submissionId);
  }
}

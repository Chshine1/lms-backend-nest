import { Inject, Injectable } from '@nestjs/common';
import type {
  IAssignmentRepository,
  IReviewRepository,
  ISubmissionRepository,
} from '../../domain/repositories/index';
import { CourseTypedClient } from '@app/typed-client';
import {
  AssignmentRepository,
  ReviewRepository,
  SubmissionRepository,
} from '../../infrastructure/repositories/index';
import { Review } from '../../domain/entities/review.entity';
import { SubmissionGradedEvent } from '../../domain/events/domain.events';
import { GradeDto, ReviewDto } from '@app/contracts';
import { EventBusService } from '@app/event-bus';

@Injectable()
export class ReviewApplicationService {
  constructor(
    @Inject(AssignmentRepository)
    private readonly assignmentRepository: IAssignmentRepository,
    @Inject(ReviewRepository)
    private readonly reviewRepository: IReviewRepository,
    @Inject(SubmissionRepository)
    private readonly submissionRepository: ISubmissionRepository,
    private readonly courseTypedClient: CourseTypedClient,
    private readonly eventBus: EventBusService,
  ) {}

  async gradeSubmission(
    submissionId: bigint,
    reviewerId: bigint,
    data: GradeDto,
  ): Promise<ReviewDto> {
    const submission = await this.submissionRepository.findById(submissionId);
    if (!submission) {
      throw new Error(`Submission ${String(submissionId)} not found`);
    }

    const assignment = await this.assignmentRepository.findById(
      submission.assignmentId,
    );
    if (!assignment) {
      throw new Error(`Assignment not found`);
    }

    const course = await this.courseTypedClient.findCourseById({
      courseId: assignment.unitId,
    });
    if (!course) {
      throw new Error(`Course not found`);
    }

    if (!course.teachers.includes(reviewerId)) {
      throw new Error(
        `User ${String(reviewerId)} is not a teacher of this course`,
      );
    }

    let review = await this.reviewRepository.findBySubmissionId(submissionId);

    if (review) {
      review.updateGrade(data.grade, assignment.totalGrade);
      review.comment = data.comment;
    } else {
      review = new Review();
      review.submissionId = submissionId;
      review.assignmentId = assignment.id;
      review.studentId = submission.studentId;
      review.reviewerId = reviewerId;
      review.grade = data.grade;
      review.comment = data.comment;
      review.reviewedAt = new Date();
    }

    await this.reviewRepository.save(review);

    const event = new SubmissionGradedEvent(
      review.id,
      review.studentId,
      review.grade,
    );
    await this.eventBus.publish(event);

    return this.mapToDto(review);
  }

  private mapToDto(review: Review): ReviewDto {
    const dto = new ReviewDto();
    dto.id = review.id;
    dto.submissionId = review.submissionId;
    dto.reviewerId = review.reviewerId;
    dto.grade = review.grade;
    dto.comment = review.comment;
    dto.reviewedAt = review.reviewedAt;
    return dto;
  }
}

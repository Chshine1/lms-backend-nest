import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Submission } from './entities/submission.entity';
import { Review } from './entities/review.entity';
import { SubmissionStatus } from '@app/contracts/assignment/entities/submission-status.enum';
import { CreateSubmissionDto } from '@app/contracts/assignment/dto/create-submission.dto';
import { UpdateSubmissionDto } from '@app/contracts/assignment/dto/update-submission.dto';
import { CreateReviewDto } from '@app/contracts/assignment/dto/create-review.dto';
import { UpdateReviewDto } from '@app/contracts/assignment/dto/update-review.dto';
import { ErrorCode } from '@app/contracts/errors/error.codes';

@Injectable()
export class AssignmentService {
  constructor(
    @InjectRepository(Submission)
    private readonly submissionRepo: Repository<Submission>,
    @InjectRepository(Review)
    private readonly reviewRepo: Repository<Review>,
  ) {}

  async createSubmission(dto: CreateSubmissionDto): Promise<Submission> {
    const activeSubmission = await this.submissionRepo.findOne({
      where: {
        enrollmentId: dto.enrollmentId,
        assignmentId: dto.assignmentId,
        status: SubmissionStatus.DRAFT,
      },
    });

    if (activeSubmission) {
      throw new BadRequestException({
        code: ErrorCode.ACTIVE_SUBMISSION_EXISTS,
        message: 'Student already has an active submission for this assignment',
      });
    }

    const submittedSubmission = await this.submissionRepo.findOne({
      where: {
        enrollmentId: dto.enrollmentId,
        assignmentId: dto.assignmentId,
        status: SubmissionStatus.SUBMITTED,
      },
    });

    if (submittedSubmission) {
      throw new BadRequestException({
        code: ErrorCode.ACTIVE_SUBMISSION_EXISTS,
        message: 'Student already has an active submission for this assignment',
      });
    }

    const submissionData: Partial<Submission> = {
      enrollmentId: dto.enrollmentId,
      assignmentId: dto.assignmentId,
      status: SubmissionStatus.DRAFT,
    };

    if (dto.submissionText !== undefined) {
      submissionData.submissionText = dto.submissionText;
    }

    if (dto.attachments !== undefined) {
      submissionData.attachments = dto.attachments;
    }

    const submission = this.submissionRepo.create(submissionData);

    return this.submissionRepo.save(submission);
  }

  async updateSubmission(
    id: number,
    dto: UpdateSubmissionDto,
  ): Promise<Submission> {
    const submission = await this.submissionRepo.findOne({ where: { id } });

    if (!submission) {
      throw new NotFoundException({
        code: ErrorCode.SUBMISSION_NOT_FOUND,
        message: 'Submission not found',
      });
    }

    if (submission.status !== SubmissionStatus.DRAFT) {
      throw new BadRequestException({
        code: ErrorCode.ALREADY_SUBMITTED,
        message: 'Cannot update submission that is not in DRAFT status',
      });
    }

    if (dto.submissionText !== undefined) {
      submission.submissionText = dto.submissionText;
    }

    if (dto.attachments !== undefined) {
      submission.attachments = dto.attachments;
    }

    return this.submissionRepo.save(submission);
  }

  async submitAssignment(id: number): Promise<Submission> {
    const submission = await this.submissionRepo.findOne({ where: { id } });

    if (!submission) {
      throw new NotFoundException({
        code: ErrorCode.SUBMISSION_NOT_FOUND,
        message: 'Submission not found',
      });
    }

    if (submission.status !== SubmissionStatus.DRAFT) {
      throw new BadRequestException({
        code: ErrorCode.ALREADY_SUBMITTED,
        message: 'Submission is not in DRAFT status',
      });
    }

    submission.status = SubmissionStatus.SUBMITTED;
    submission.submittedAt = new Date();

    return this.submissionRepo.save(submission);
  }

  async getSubmissionByEnrollmentAndAssignment(
    enrollmentId: number,
    assignmentId: number,
  ): Promise<Submission | null> {
    return this.submissionRepo.findOne({
      where: {
        enrollmentId,
        assignmentId,
      },
      relations: ['review'],
    });
  }

  async getSubmissionsByAssignment(
    assignmentId: number,
  ): Promise<Submission[]> {
    return this.submissionRepo.find({
      where: {
        assignmentId,
      },
      relations: ['review'],
    });
  }

  async getSubmissionById(id: number): Promise<Submission | null> {
    return this.submissionRepo.findOne({
      where: { id },
      relations: ['review'],
    });
  }

  async createReview(
    submissionId: number,
    dto: CreateReviewDto,
  ): Promise<Review> {
    const submission = await this.submissionRepo.findOne({
      where: { id: submissionId },
    });

    if (!submission) {
      throw new NotFoundException({
        code: ErrorCode.SUBMISSION_NOT_FOUND,
        message: 'Submission not found',
      });
    }

    if (submission.status !== SubmissionStatus.SUBMITTED) {
      throw new BadRequestException({
        code: ErrorCode.ALREADY_GRADED,
        message: 'Submission is not in SUBMITTED status',
      });
    }

    const existingReview = await this.reviewRepo.findOne({
      where: { submissionId },
    });

    if (existingReview) {
      throw new BadRequestException({
        code: ErrorCode.ALREADY_GRADED,
        message: 'Review already exists for this submission',
      });
    }

    if (dto.score < 0 || dto.score > 100) {
      throw new BadRequestException({
        code: ErrorCode.INVALID_SCORE,
        message: 'Score must be between 0 and 100',
      });
    }

    const review = this.reviewRepo.create({
      submissionId,
      teacherId: dto.teacherId,
      score: dto.score,
      feedback: dto.feedback,
      reviewedAt: new Date(),
    });

    const savedReview = await this.reviewRepo.save(review);

    submission.status = SubmissionStatus.GRADED;
    await this.submissionRepo.save(submission);

    return savedReview;
  }

  async updateReview(
    submissionId: number,
    dto: UpdateReviewDto,
  ): Promise<Review> {
    const review = await this.reviewRepo.findOne({
      where: { submissionId },
    });

    if (!review) {
      throw new NotFoundException({
        code: ErrorCode.REVIEW_NOT_FOUND,
        message: 'Review not found',
      });
    }

    if (dto.score !== undefined) {
      if (dto.score < 0 || dto.score > 100) {
        throw new BadRequestException({
          code: ErrorCode.INVALID_SCORE,
          message: 'Score must be between 0 and 100',
        });
      }
      review.score = dto.score;
    }

    if (dto.feedback !== undefined) {
      review.feedback = dto.feedback;
    }

    return this.reviewRepo.save(review);
  }

  async getReviewBySubmission(submissionId: number): Promise<Review | null> {
    return this.reviewRepo.findOne({
      where: { submissionId },
    });
  }
}

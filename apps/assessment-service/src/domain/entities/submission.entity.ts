import { defineEntity, p } from '@mikro-orm/core';
import { AggregateRootSchema } from '@app/contracts';

const SubmissionSchema = defineEntity({
  name: 'Submission',
  extends: AggregateRootSchema,
  tableName: 'submissions',
  properties: {
    studentId: p.bigint(),
    assignmentId: p.bigint(),
    content: p.text().default(''),
    submissionCount: p.integer().default(1),
    submittedAt: p.datetime(),
    files: p.jsonb().default('[]'),
  },
  indexes: [
    {
      name: 'submission_student_assignment_unique',
      properties: ['studentId', 'assignmentId'],
      type: 'unique',
    },
  ],
});

export class Submission extends SubmissionSchema.class {
  declare submittedAt: Date;

  updateContent(
    newContent: string,
    newFiles: { fileKey: string; fileName: string }[],
    assignment: { dueTime: Date; allowedResubmissions: number },
  ): void {
    const now = new Date();
    if (now > assignment.dueTime) {
      throw new Error('Submission window has closed');
    }

    const maxResubmissions = assignment.allowedResubmissions;
    if (maxResubmissions !== -1 && this.submissionCount >= maxResubmissions) {
      throw new Error('Resubmission limit exceeded');
    }

    this.content = newContent;
    this.files = newFiles;
    this.submissionCount++;
    this.submittedAt = now;
  }
}

import { defineEntity, p } from '@mikro-orm/core';
import { AggregateRootSchema } from '@app/contracts';
import { AssignmentType } from '../enums/assignment-type.enum';

const AssignmentSchema = defineEntity({
  name: 'Assignment',
  extends: AggregateRootSchema,
  tableName: 'assignments',
  properties: {
    unitId: p.bigint().primary(),
    title: p.string().length(255),
    type: p.enum(() => AssignmentType).nativeEnumName('assignment_type'),
    content: p.json(),
    dueTime: p.datetime(),
    allowedResubmissions: p.integer().default(-1),
    totalGrade: p.integer(),
  },
});

export class Assignment extends AssignmentSchema.class {
  declare allowedResubmissions: number;

  constructor() {
    super();
    this.allowedResubmissions = -1;
  }

  canAcceptSubmission(): boolean {
    return new Date() < this.dueTime;
  }

  validateGradingScale(grade: number): void {
    if (grade < 0 || grade > this.totalGrade) {
      throw new Error(`Grade must be between 0 and ${String(this.totalGrade)}`);
    }
  }
}

AssignmentSchema.setClass(Assignment);

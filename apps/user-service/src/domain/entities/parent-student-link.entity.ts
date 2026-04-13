import { defineEntity, p } from '@mikro-orm/core';
import { LinkEntitySchema } from '@app/contracts';

const ParentStudentLinkSchema = defineEntity({
  name: 'ParentStudentLink',
  extends: LinkEntitySchema,
  tableName: 'lnk_parent_student',
  properties: {
    parentUserId: p.bigint().primary(),
    studentUserId: p.bigint().primary(),
  },
});

export class ParentStudentLink extends ParentStudentLinkSchema.class {
  constructor(parentUserId: bigint, studentUserId: bigint) {
    super();
    this.parentUserId = parentUserId;
    this.studentUserId = studentUserId;
  }
}

ParentStudentLinkSchema.setClass(ParentStudentLink);

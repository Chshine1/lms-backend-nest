import { Entity, PrimaryKey, Property } from '@mikro-orm/core';

@Entity({ tableName: 'parent_student_links' })
export class ParentStudentLink {
  @PrimaryKey({ fieldName: 'parent_user_id', type: 'bigint' })
  parentUserId!: number;

  @PrimaryKey({ fieldName: 'student_user_id', type: 'bigint' })
  studentUserId!: number;

  @Property({ fieldName: 'created_at' })
  createdAt: Date = new Date();

  constructor(parentUserId: number, studentUserId: number) {
    this.parentUserId = parentUserId;
    this.studentUserId = studentUserId;
    this.createdAt = new Date();
  }
}

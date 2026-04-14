import { defineEntity, p } from '@mikro-orm/core';
import { AggregateRootSchema } from '@app/contracts';
import { EnrollmentStatus } from '../enums/enrollment-status.enum';

const EnrollmentSchema = defineEntity({
  name: 'Enrollment',
  extends: AggregateRootSchema,
  tableName: 'enrollments',
  properties: {
    studentId: p.bigint(),
    courseId: p.bigint(),
    enrolledAt: p.datetime(),
    status: p
      .enum(() => EnrollmentStatus)
      .nativeEnumName('enrollment_status')
      .default(EnrollmentStatus.ACTIVE),
  },
  indexes: [
    {
      name: 'enrollment_student_course_unique',
      properties: ['studentId', 'courseId'],
      type: 'unique',
    },
  ],
});

export class Enrollment extends EnrollmentSchema.class {
  declare enrolledAt: Date;

  constructor(studentId: bigint, courseId: bigint) {
    super();
    this.studentId = studentId;
    this.courseId = courseId;
    this.enrolledAt = new Date();
    this.status = EnrollmentStatus.ACTIVE;
  }
}

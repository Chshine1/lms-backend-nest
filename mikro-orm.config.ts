import 'reflect-metadata';
import { defineConfig } from '@mikro-orm/postgresql';
import { Migrator } from '@mikro-orm/migrations';
import { Assignment } from './apps/assessment-service/src/domain/entities/assignment.entity';
import { AssignmentFile } from './apps/assessment-service/src/domain/entities/assignment-file.entity';
import { Submission } from './apps/assessment-service/src/domain/entities/submission.entity';
import { SubmissionFile } from './apps/assessment-service/src/domain/entities/submission-file.entity';
import { Review } from './apps/assessment-service/src/domain/entities/review.entity';
import { Course } from './apps/course-service/src/domain/entities/course.entity';
import { Enrollment } from './apps/course-service/src/domain/entities/enrollment.entity';
import { User } from './apps/user-service/src/domain/entities/user.entity';
import { Role } from './apps/user-service/src/domain/entities/role.entity';
import { Tenant } from './apps/user-service/src/domain/entities/tenant.entity';
import { StudentProfile } from './apps/user-service/src/domain/entities/student-profile.entity';
import { ParentStudentLink } from './apps/user-service/src/domain/entities/parent-student-link.entity';
import { UserRoleLink } from './apps/user-service/src/domain/entities/user-role-link.entity';

export default defineConfig({
  clientUrl: `postgresql://lms:lms@${process.env['DB_HOST'] ?? 'localhost'}:5432/lms`,
  entities: [
    Assignment, AssignmentFile,
    Submission, SubmissionFile,
    Review,
    Course, Enrollment,
    User, Role, Tenant,
    StudentProfile, ParentStudentLink, UserRoleLink,
  ],
  extensions: [Migrator],
  migrations: {
    path: './migrations',
    tableName: 'mikro_orm_migrations',
    transactional: true,
  },
});
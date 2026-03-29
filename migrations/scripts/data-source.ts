import { DataSource, DataSourceOptions } from 'typeorm';
import { Admin } from '../../apps/user-service/src/entities/admin.entity';
import { Campus } from '../../apps/user-service/src/entities/campus.entity';
import { Parent } from '../../apps/user-service/src/entities/parent.entity';
import { Student } from '../../apps/user-service/src/entities/student.entity';
import { Teacher } from '../../apps/user-service/src/entities/teacher.entity';
import { Tenant } from '../../apps/user-service/src/entities/tenant.entity';
import { User } from '../../apps/user-service/src/entities/user.entity';
import { UserPermission } from '../../apps/user-service/src/entities/user-permission.entity';
import { Course } from '../../apps/course-service/src/entities/course.entity';
import { CourseMaterial } from '../../apps/course-service/src/entities/course-material.entity';
import { CourseSchedule } from '../../apps/course-scheduling-service/src/entities/course-schedule.entity';
import { Enrollment } from '../../apps/course-enrollment-service/src/entities/enrollment.entity';
import { File } from '../../apps/file-service/src/entities/file.entity';
import { Review } from '../../apps/assignment-service/src/entities/review.entity';
import { Submission } from '../../apps/assignment-service/src/entities/submission.entity';

const options: DataSourceOptions = {
  type: 'postgres',
  host: process.env['DB_HOST'] || 'localhost',
  port: 5432,
  username: 'lms',
  password: 'lms',
  database: 'lms',
  entities: [
    Admin,
    Campus,
    Parent,
    Student,
    Teacher,
    Tenant,
    User,
    UserPermission,
    Course,
    CourseMaterial,
    CourseSchedule,
    Enrollment,
    File,
    Review,
    Submission,
  ],
  migrations: ['migrations/*.ts'],
  synchronize: false,
};

// noinspection JSUnusedGlobalSymbols
export default new DataSource(options);

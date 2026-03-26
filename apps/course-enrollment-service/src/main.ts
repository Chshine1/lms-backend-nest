import { NestFactory } from '@nestjs/core';
import { CourseEnrollmentModule } from '@/course-enrollment-service/src/course-enrollment.module';

async function bootstrap(): Promise<void> {
  await NestFactory.createApplicationContext(CourseEnrollmentModule);
}

void bootstrap();

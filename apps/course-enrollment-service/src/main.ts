import { NestFactory } from '@nestjs/core';
import { CourseEnrollmentModule } from '@/course-enrollment-service/src/course-enrollment.module';
import { initializeInfrastructure } from '@app/infrastructure';

async function bootstrap(): Promise<void> {
  await initializeInfrastructure();
  await NestFactory.createApplicationContext(CourseEnrollmentModule);
}

void bootstrap();

import { NestFactory } from '@nestjs/core';
import { CourseModule } from '@/course-service/src/course.module';
import { initializeInfrastructure } from '@app/infrastructure';

async function bootstrap(): Promise<void> {
  await initializeInfrastructure();
  await NestFactory.createApplicationContext(CourseModule);
}

void bootstrap();

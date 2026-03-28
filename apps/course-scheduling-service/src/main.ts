import { NestFactory } from '@nestjs/core';
import { CourseSchedulingModule } from '@/course-scheduling-service/src/course-scheduling.module';
import { initializeInfrastructure } from '@app/infrastructure';

async function bootstrap(): Promise<void> {
  await initializeInfrastructure();
  await NestFactory.createApplicationContext(CourseSchedulingModule);
}

void bootstrap();

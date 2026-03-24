import { NestFactory } from '@nestjs/core';
import { CourseSchedulingModule } from './course-scheduling.module';

async function bootstrap(): Promise<void> {
  await NestFactory.createApplicationContext(CourseSchedulingModule);
}

void bootstrap();

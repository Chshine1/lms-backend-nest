import { NestFactory } from '@nestjs/core';
import { CourseModule } from './course.module';

async function bootstrap(): Promise<void> {
  await NestFactory.createApplicationContext(CourseModule);
}

void bootstrap();

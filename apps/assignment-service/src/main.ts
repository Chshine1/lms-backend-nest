import { NestFactory } from '@nestjs/core';
import { AssignmentModule } from './assignment.module';

async function bootstrap(): Promise<void> {
  await NestFactory.createApplicationContext(AssignmentModule);
}

void bootstrap();

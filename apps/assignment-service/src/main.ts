import { NestFactory } from '@nestjs/core';
import { AssignmentModule } from './assignment.module';
import { initializeInfrastructure } from '@app/infrastructure';

async function bootstrap(): Promise<void> {
  await initializeInfrastructure();
  await NestFactory.createApplicationContext(AssignmentModule);
}

void bootstrap();

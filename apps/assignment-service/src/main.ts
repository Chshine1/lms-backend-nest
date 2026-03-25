import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AssignmentModule } from './assignment.module';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AssignmentModule);
  app.useGlobalPipes(new ValidationPipe({ transform: true }));
  await app.listen(process.env['PORT'] ?? 3000);
}

void bootstrap();

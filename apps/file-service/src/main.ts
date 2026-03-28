import { NestFactory } from '@nestjs/core';
import { FileModule } from '@/file-service/src/file.module';
import { initializeInfrastructure } from '@app/infrastructure';

async function bootstrap(): Promise<void> {
  await initializeInfrastructure();
  await NestFactory.createApplicationContext(FileModule);
}

void bootstrap();

import { NestFactory } from '@nestjs/core';
import { FileModule } from '@/file-service/src/file.module';

async function bootstrap(): Promise<void> {
  await NestFactory.createApplicationContext(FileModule);
}

void bootstrap();

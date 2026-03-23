import { NestFactory } from '@nestjs/core';
import { FileServiceModule } from '@/file-service/src/file-service.module';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(FileServiceModule);
  await app.listen(process.env['port'] ?? 3000);
}
void bootstrap();

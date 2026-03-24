import { NestFactory } from '@nestjs/core';
import { AssignmentServiceModule } from './assignment-service.module';

async function bootstrap() {
  const app = await NestFactory.create(AssignmentServiceModule);
  await app.listen(process.env.port ?? 3000);
}
bootstrap();

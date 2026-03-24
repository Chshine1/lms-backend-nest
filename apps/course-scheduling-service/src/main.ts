import { NestFactory } from '@nestjs/core';
import { CourseSchedulingServiceModule } from './course-scheduling-service.module';

async function bootstrap() {
  const app = await NestFactory.create(CourseSchedulingServiceModule);
  await app.listen(process.env.port ?? 3000);
}
bootstrap();

import { NestFactory } from '@nestjs/core';
import { CourseEnrollmentServiceModule } from './course-enrollment-service.module';

async function bootstrap() {
  const app = await NestFactory.create(CourseEnrollmentServiceModule);
  await app.listen(process.env.port ?? 3000);
}
bootstrap();

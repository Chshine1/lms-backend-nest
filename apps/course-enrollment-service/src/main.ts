import { NestFactory } from '@nestjs/core';
import { CourseEnrollmentModule } from '@/course-enrollment-service/src/course-enrollment.module';
import { ConfigurationService } from '@app/infrastructure';
import { HealthConfig } from '@app/contracts';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(CourseEnrollmentModule);

  const configService = app.get(ConfigurationService);
  const healthConfig = configService.getByKey('health', HealthConfig);
  await app.listen(healthConfig.port);
}

void bootstrap();

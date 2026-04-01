import { NestFactory } from '@nestjs/core';
import { CourseSchedulingModule } from '@/course-scheduling-service/src/course-scheduling.module';
import { ConfigurationService } from '@app/infrastructure';
import { HealthConfig } from '@app/contracts';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(CourseSchedulingModule);

  const configService = app.get(ConfigurationService);
  const healthConfig = configService.getByKey('health', HealthConfig);
  await app.listen(healthConfig.port);
}

void bootstrap();

import { NestFactory } from '@nestjs/core';
import { ConfigurationService } from '@app/infrastructure';
import { HealthConfig } from '@app/contracts';
import { AssessmentModule } from '@/assessment-service/src/assessment.module';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AssessmentModule);

  const configService = app.get(ConfigurationService);
  const healthConfig = configService.getByKey('health', HealthConfig);
  await app.listen(healthConfig.port);
}

void bootstrap();

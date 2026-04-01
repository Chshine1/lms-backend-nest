import { NestFactory } from '@nestjs/core';
import { UserModule } from './user.module';
import { ConfigurationService } from '@app/infrastructure';
import { HealthConfig } from '@app/contracts';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(UserModule);

  const configService = app.get(ConfigurationService);
  const healthConfig = configService.getByKey('health', HealthConfig);
  await app.listen(healthConfig.port);
}

void bootstrap();

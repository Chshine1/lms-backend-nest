import { NestFactory } from '@nestjs/core';
import { UserModule } from './user.module';
import { initializeInfrastructure } from '@app/infrastructure';

async function bootstrap(): Promise<void> {
  await initializeInfrastructure();
  await NestFactory.createApplicationContext(UserModule);
}

void bootstrap();

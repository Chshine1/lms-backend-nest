import { NestFactory } from '@nestjs/core';
import { UserModule } from './user.module';

async function bootstrap(): Promise<void> {
  await NestFactory.createApplicationContext(UserModule);
}

void bootstrap();

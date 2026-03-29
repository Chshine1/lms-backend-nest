import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigurationService } from '@app/infrastructure';
import { GatewayConfig } from '@app/infrastructure';
import { AppModule } from './app.module';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({ transform: true }));

  const configService = app.get(ConfigurationService);
  const gatewayConfig = configService.getByKey('gateway', GatewayConfig);
  await app.listen(gatewayConfig.port);
}

bootstrap().catch((error: unknown) => {
  console.error(error);
});

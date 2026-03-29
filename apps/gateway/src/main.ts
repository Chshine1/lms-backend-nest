import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import {
  ConfigurationService,
  initializeInfrastructure,
} from '@app/infrastructure';
import { ClassConstructor } from 'class-transformer';
import { GatewayConfig } from '@app/infrastructure';

async function bootstrap(): Promise<void> {
  await initializeInfrastructure();

  const { AppModule } = (await import('./app.module.js')) as {
    AppModule: ClassConstructor<unknown>;
  };
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({ transform: true }));

  const configService = app.get(ConfigurationService);
  const gatewayConfig = configService.getByKey('gateway', GatewayConfig);
  await app.listen(gatewayConfig.port);
}

bootstrap().catch((error: unknown) => {
  console.error(error);
});

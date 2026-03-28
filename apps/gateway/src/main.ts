import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import {
  ConfigurationService,
  initializeInfrastructure,
} from '@app/infrastructure';
import { ClassConstructor, Expose } from 'class-transformer';
import { IsDefined, IsNumber } from 'class-validator';

class GatewayConfig {
  @Expose()
  @IsDefined()
  @IsNumber()
  port!: number;
}

async function bootstrap(): Promise<void> {
  await initializeInfrastructure();

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-expect-error
  const { AppModule } = (await import('./app.module')) as {
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

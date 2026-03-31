import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigurationService } from '@app/infrastructure';
import { GatewayConfig } from '@app/infrastructure';
import { AppModule } from './app.module';
import { DocumentBuilder, OpenAPIObject, SwaggerModule } from '@nestjs/swagger';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({ transform: true }));

  const config = new DocumentBuilder()
    .setTitle('Cats example')
    .setDescription('The cats API description')
    .setVersion('1.0')
    .addTag('cats')
    .build();
  const documentFactory = (): OpenAPIObject =>
    SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, documentFactory);

  const configService = app.get(ConfigurationService);
  const gatewayConfig = configService.getByKey('gateway', GatewayConfig);
  await app.listen(gatewayConfig.port);
}

bootstrap().catch((error: unknown) => {
  console.error(error);
});

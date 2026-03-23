import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { FileServiceModule } from '@/file-service/src/file-service.module';
import { ConfigService } from '@nestjs/config';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(FileServiceModule);

  const configService = app.get(ConfigService);
  const host = configService.get<string>('host', '0.0.0.0');
  const port = configService.get<number>('port', 3003);

  const microservice =
    await NestFactory.createMicroservice<MicroserviceOptions>(
      FileServiceModule,
      {
        transport: Transport.TCP,
        options: {
          host,
          port,
        },
      },
    );
  await microservice.listen();
}

void bootstrap();

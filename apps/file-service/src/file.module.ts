import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { File } from './entities/file.entity';
import { FileController } from './file.controller';
import { FileService } from './file.service';
import {
  IStorageProvider,
  STORAGE_PROVIDER_TOKEN,
} from '@/file-service/src/storage/storage-provider.interface';
import { LocalStorageProvider } from '@/file-service/src/storage/providers/local-storage.provider';
import { S3StorageProvider } from '@/file-service/src/storage/providers/s3-storage.provider';
import {
  ConfigurationService,
  InfrastructureModule,
} from '@app/infrastructure';
import { StorageConfig, StorageProviderType } from '@app/contracts';
import { IsDefined, IsString } from 'class-validator';

class RabbitMQConfigSection {
  @IsString()
  @IsDefined()
  host!: string;
  @IsString()
  @IsDefined()
  port!: number;
  @IsString()
  @IsDefined()
  username!: string;
  @IsString()
  @IsDefined()
  password!: string;
}

const storageProviderFactory = (
  configurationService: ConfigurationService,
): IStorageProvider => {
  const storageConfig = configurationService.getByKey('storage', StorageConfig);

  switch (storageConfig.provider) {
    case StorageProviderType.S3:
      return new S3StorageProvider(configurationService);
    case StorageProviderType.LOCAL:
    default:
      return new LocalStorageProvider(configurationService);
  }
};

@Module({
  imports: [
    InfrastructureModule.forRoot(),
    TypeOrmModule.forRoot(),
    TypeOrmModule.forFeature([File]),
    RabbitMQModule.forRootAsync({
      useFactory: (configService: ConfigurationService) => {
        const section = configService.get(RabbitMQConfigSection);
        return {
          exchanges: [
            {
              name: 'file-service',
              type: 'topic',
            },
          ],
          uri: `amqp://${section.username}:${section.password}@${section.host}:${section.port.toString()}`,
          connectionInitOptions: { wait: true },
        };
      },
      inject: [ConfigurationService],
    }),
  ],
  controllers: [FileController],
  providers: [
    FileService,
    {
      provide: STORAGE_PROVIDER_TOKEN,
      useFactory: storageProviderFactory,
      inject: [ConfigurationService],
    },
  ],
})
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class FileModule {}

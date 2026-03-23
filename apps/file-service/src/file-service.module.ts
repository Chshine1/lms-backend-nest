import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { File } from './entities/file.entity';
import { FileServiceController } from './file-service.controller';
import { FileService } from './file-service.service';
import {
  STORAGE_PROVIDER_TOKEN,
  IStorageProvider,
} from '@/file-service/src/storage/storage-provider.interface';
import { LocalStorageProvider } from '@/file-service/src/storage/providers/local-storage.provider';
import { S3StorageProvider } from '@/file-service/src/storage/providers/s3-storage.provider';
import { InfrastructureModule } from '@app/infrastructure/infrastructure.module';
import { ConfigurationService } from '@app/infrastructure/modules/configuration/configuration.service';
import {
  StorageConfig,
  StorageProviderType,
} from '@app/contracts/config/storage.config';

const storageProviderFactory = (
  configurationService: ConfigurationService,
): IStorageProvider => {
  const storageConfig = configurationService.get(StorageConfig);

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
  ],
  controllers: [FileServiceController],
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
export class FileServiceModule {}

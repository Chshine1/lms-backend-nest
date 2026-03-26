import { Module } from '@nestjs/common';
import { File } from './entities/file.entity';
import { FileController } from './file.controller';
import { FileService } from './file.service';
import { IStorageProvider, STORAGE_PROVIDER_TOKEN, } from '@/file-service/src/storage/storage-provider.interface';
import { LocalStorageProvider } from '@/file-service/src/storage/providers/local-storage.provider';
import { S3StorageProvider } from '@/file-service/src/storage/providers/s3-storage.provider';
import { ConfigurationService, InfrastructureModule, } from '@app/infrastructure';
import { StorageConfig, StorageProviderType } from '@app/contracts';

@Module({
  imports: [
    InfrastructureModule.forRootAsync(),
    InfrastructureModule.forMicroserviceAsync({
      entities: [File],
      exchanges: [{ name: 'file-service', type: 'topic' }],
    }),
  ],
  controllers: [FileController],
  providers: [
    FileService,
    {
      provide: STORAGE_PROVIDER_TOKEN,
      useFactory: (
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
      },
      inject: [ConfigurationService],
    },
  ],
})
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class FileModule {}

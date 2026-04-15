import { Module } from '@nestjs/common';

import { ConfigurationModule } from '../configuration/configuration.module';
import { ConfigurationService } from '../configuration/configuration.service';
import { FileStorageService } from './file-storage.factory';
import { LocalFileStorageService } from './local-file-storage.service';
import { OssFileStorageService } from './oss-file-storage.service';
import { StorageConfig } from '@app/contracts';

@Module({
  imports: [ConfigurationModule],
  providers: [
    {
      provide: StorageConfig,
      useFactory: (configService: ConfigurationService): StorageConfig => {
        return configService.get(StorageConfig);
      },
      inject: [ConfigurationService],
    },
    LocalFileStorageService,
    OssFileStorageService,
    FileStorageService,
  ],
  exports: [FileStorageService],
})
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class FileStorageModule {}

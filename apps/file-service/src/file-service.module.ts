import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { File } from './entities/file.entity';
import { FileServiceController } from './file-service.controller';
import { FileService } from './file-service.service';
import { STORAGE_PROVIDER_TOKEN } from '@/file-service/src/storage/storage-provider.interface';
import { LocalStorageProvider } from '@/file-service/src/storage/providers/local-storage.provider';
import { InfrastructureModule } from '@app/infrastructure/infrastructure.module';

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
      useClass: LocalStorageProvider,
    },
  ],
})
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class FileServiceModule {}

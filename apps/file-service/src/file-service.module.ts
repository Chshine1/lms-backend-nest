import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { File } from './entities/file.entity';
import { FileServiceController } from './file-service.controller';
import { FileService } from './file-service.service';
import { StorageModule } from './storage/storage.module';

@Module({
  imports: [TypeOrmModule.forFeature([File]), StorageModule],
  controllers: [FileServiceController],
  providers: [FileService],
})
export class FileServiceModule {}

import { Module } from '@nestjs/common';
import { LoggerModule } from './modules/logger/logger.module';
import { ConfigurationModule } from './modules/configuration/configuration.module';
import { FileStorageModule } from './modules/file-storage/index';

@Module({
  imports: [ConfigurationModule, LoggerModule, FileStorageModule],
  exports: [ConfigurationModule, LoggerModule, FileStorageModule],
})
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class InfrastructureModule {}

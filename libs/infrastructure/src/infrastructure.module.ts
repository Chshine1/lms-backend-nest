import { Module } from '@nestjs/common';
import { LoggerModule } from './modules/logger/logger.module';
import { ConfigurationModule } from './modules/configuration/configuration.module';

@Module({
  imports: [ConfigurationModule, LoggerModule],
  exports: [ConfigurationModule, LoggerModule],
})
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class InfrastructureModule {}

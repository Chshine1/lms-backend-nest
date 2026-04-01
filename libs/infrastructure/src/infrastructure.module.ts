import { Module } from '@nestjs/common';
import { LoggerModule } from './modules/logger/logger.module';
import { ConfigurationModule } from './modules/configuration/configuration.module';
import { HealthModule } from './modules/health/health.module';

@Module({
  imports: [ConfigurationModule, LoggerModule],
  exports: [ConfigurationModule, LoggerModule, HealthModule],
})
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class InfrastructureModule {}

import { Module } from '@nestjs/common';
import { LoggerHealthIndicator } from './indicators/logger.health';
import { HealthController } from './health.controller';

@Module({
  providers: [LoggerHealthIndicator],
  controllers: [HealthController],
})
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class HealthModule {}

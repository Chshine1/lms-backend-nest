import { Module } from '@nestjs/common';
import { LoggerHealthIndicator } from '@app/health/indicators/logger.health';

@Module({
  providers: [LoggerHealthIndicator],
  exports: [LoggerHealthIndicator],
})
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class HealthModule {}

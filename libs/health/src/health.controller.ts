import { Controller, Get } from '@nestjs/common';
import {
  HealthCheck,
  HealthCheckService,
  HealthIndicatorResult,
  TypeOrmHealthIndicator,
} from '@nestjs/terminus';
import { LoggerHealthIndicator } from '@app/health/indicators/logger.health';

@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private db: TypeOrmHealthIndicator,
    private loggerHealthIndicator: LoggerHealthIndicator,
  ) {}

  @Get('readiness')
  @HealthCheck()
  readiness(): ReturnType<typeof this.health.check> {
    return this.health.check([
      (): Promise<HealthIndicatorResult> =>
        this.db.pingCheck('database', { timeout: 300 }),
      (): Promise<HealthIndicatorResult> =>
        this.loggerHealthIndicator.isHealthy('logger'),
    ]);
  }
}

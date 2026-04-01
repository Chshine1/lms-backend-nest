import { Controller, Get } from '@nestjs/common';
import { DatabaseHealthIndicator } from './indicators/database.health';
import { RabbitMQHealthIndicator } from './indicators/rabbitmq.health';
import {
  HealthCheck,
  HealthCheckService,
  HealthIndicatorResult,
  HealthCheckResult,
} from '@nestjs/terminus';

@Controller('health')
export class HealthController {
  constructor(
    private readonly healthCheckService: HealthCheckService,
    private readonly databaseHealthIndicator: DatabaseHealthIndicator,
    private readonly rabbitMQHealthIndicator: RabbitMQHealthIndicator,
  ) {}

  @Get()
  @HealthCheck()
  async check(): Promise<HealthCheckResult> {
    return this.healthCheckService.check([
      (): Promise<HealthIndicatorResult> =>
        this.databaseHealthIndicator.isHealthy('database'),
      (): Promise<HealthIndicatorResult> =>
        this.rabbitMQHealthIndicator.isHealthy('rabbitmq'),
    ]);
  }
}

import { Controller, Get } from '@nestjs/common';
import { DatabaseHealthIndicator } from './indicators/database.health';
import { RabbitMqHealthIndicator } from './indicators/rabbitmq.health';
import { HealthModuleConfig } from './health-module.config';

interface HealthCheck {
  name: string;
  status: 'up' | 'down';
  message: string;
}

interface HealthResponse {
  status: 'ok' | 'error';
  checks: HealthCheck[];
}

@Controller('health')
export class HealthController {
  constructor(
    private readonly databaseHealth: DatabaseHealthIndicator,
    private readonly rabbitMqHealth: RabbitMqHealthIndicator,
    private readonly config: HealthModuleConfig,
  ) {}

  @Get()
  async check(): Promise<HealthResponse> {
    const checks: HealthCheck[] = [];

    if (this.config.database) {
      const result = await this.databaseHealth.check();
      checks.push({
        name: 'database',
        status: result.status,
        message: result.message,
      });
    }

    if (this.config.rabbitmq) {
      const result = await this.rabbitMqHealth.check();
      checks.push({
        name: 'rabbitmq',
        status: result.status,
        message: result.message,
      });
    }

    const overallStatus = checks.every((c) => c.status === 'up')
      ? 'ok'
      : 'error';

    return { status: overallStatus, checks };
  }
}

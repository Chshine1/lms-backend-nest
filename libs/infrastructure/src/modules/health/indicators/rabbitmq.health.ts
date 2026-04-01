import { Injectable } from '@nestjs/common';
import { RabbitMQConnectionService } from '@app/rabbitmq';

export interface RabbitMqHealthResult {
  status: 'up' | 'down';
  message: string;
}

@Injectable()
export class RabbitMqHealthIndicator {
  constructor(private readonly rabbitMqConnection: RabbitMQConnectionService) {}

  async check(): Promise<RabbitMqHealthResult> {
    try {
      const connection = await this.rabbitMqConnection.getConnection();
      if (connection !== null) {
        return { status: 'up', message: 'RabbitMQ connection is healthy' };
      }
      return { status: 'down', message: 'RabbitMQ is not connected' };
    } catch {
      return { status: 'down', message: 'RabbitMQ connection check failed' };
    }
  }
}

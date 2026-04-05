import { Injectable } from '@nestjs/common';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import {
  HealthIndicatorResult,
  HealthIndicatorService,
} from '@nestjs/terminus';
import type { Channel } from 'amqplib';
import { v4 as uuid } from 'uuid';

@Injectable()
export class RabbitMQHealthIndicator {
  constructor(
    private readonly amqpConnection: AmqpConnection,
    private readonly healthIndicatorService: HealthIndicatorService,
  ) {}

  async isHealthy(key: string): Promise<HealthIndicatorResult> {
    const indicator = this.healthIndicatorService.check(key);
    if (!this.amqpConnection.connected) {
      return indicator.down({ message: 'RabbitMQ not connected' });
    }

    try {
      const testQueue = `health-check-queue-${uuid()}`;
      const testMessage = { timestamp: Date.now() };

      const channel: Channel = this.amqpConnection.channel;

      await channel.assertQueue(testQueue, {
        durable: false,
        autoDelete: true,
      });
      channel.publish('', testQueue, Buffer.from(JSON.stringify(testMessage)), {
        persistent: false,
      });
      await channel.consume(testQueue, () => {});
      await channel.deleteQueue(testQueue);
    } catch (error) {
      return indicator.down({ message: 'RabbitMQ health check failed', error });
    }
    return indicator.up();
  }
}

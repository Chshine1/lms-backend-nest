import { Injectable } from '@nestjs/common';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import {
  HealthIndicatorResult,
  HealthIndicatorService,
} from '@nestjs/terminus';

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
      const testQueue = 'health-check-queue';
      const testMessage = { timestamp: Date.now() };

      await this.amqpConnection.channel.assertQueue(testQueue, {
        durable: false,
        autoDelete: true,
      });
      this.amqpConnection.channel.publish(
        '',
        testQueue,
        Buffer.from(JSON.stringify(testMessage)),
        {
          persistent: false,
        },
      );
      await this.amqpConnection.channel.consume(testQueue, () => {});
      await this.amqpConnection.channel.deleteQueue(testQueue);
    } catch (error) {
      return indicator.down({ message: 'RabbitMQ health check failed', error });
    }
    return indicator.up();
  }
}

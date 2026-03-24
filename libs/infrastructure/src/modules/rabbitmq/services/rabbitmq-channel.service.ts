import { Injectable } from '@nestjs/common';
import type * as amqplib from 'amqplib';
import type {
  RabbitMQExchangeOptions,
  RabbitMQQueueOptions,
  RabbitMQBindingOptions,
} from '@app/infrastructure/modules/rabbitmq/contracts/rabbitmq-options.interface';
import { RabbitMQConnectionService } from '@app/infrastructure/modules/rabbitmq/services/rabbitmq-connection.service';
import { RabbitMQChannelError } from '@app/infrastructure/modules/rabbitmq/errors/rabbitmq-channel.error';

@Injectable()
export class RabbitMQChannelService {
  private channel: amqplib.Channel | null = null;

  constructor(private readonly connectionService: RabbitMQConnectionService) {}

  async getChannel(): Promise<amqplib.Channel> {
    if (this.channel) {
      return this.channel;
    }

    const connection = await this.connectionService.getConnection();
    this.channel = await connection.createChannel();

    this.channel.on('error', () => {
      this.channel = null;
    });

    this.channel.on('close', () => {
      this.channel = null;
    });

    return this.channel;
  }

  async assertExchange(
    options: RabbitMQExchangeOptions,
  ): Promise<amqplib.Replies.AssertExchange> {
    try {
      const channel = await this.getChannel();
      return await channel.assertExchange(options.name, options.type, {
        durable: options.durable ?? true,
        autoDelete: options.autoDelete ?? false,
        arguments: options.arguments,
      });
    } catch (cause) {
      throw new RabbitMQChannelError(`assertExchange: ${options.name}`, cause);
    }
  }

  async assertQueue(
    options: RabbitMQQueueOptions,
  ): Promise<amqplib.Replies.AssertQueue> {
    try {
      const channel = await this.getChannel();
      return await channel.assertQueue(options.name, {
        durable: options.durable ?? true,
        exclusive: options.exclusive ?? false,
        autoDelete: options.autoDelete ?? false,
        arguments: options.arguments,
      });
    } catch (cause) {
      throw new RabbitMQChannelError(`assertQueue: ${options.name}`, cause);
    }
  }

  async bindQueue(
    options: RabbitMQBindingOptions,
  ): Promise<amqplib.Replies.Empty> {
    try {
      const channel = await this.getChannel();
      return await channel.bindQueue(
        options.target,
        options.source,
        options.routingKey ?? '',
        options.arguments,
      );
    } catch (cause) {
      throw new RabbitMQChannelError(
        `bindQueue: ${options.source} -> ${options.target}`,
        cause,
      );
    }
  }

  async publish(
    exchange: string,
    routingKey: string,
    content: Buffer,
    options?: amqplib.Options.Publish,
  ): Promise<boolean> {
    try {
      const channel = await this.getChannel();
      return channel.publish(exchange, routingKey, content, options);
    } catch (cause) {
      throw new RabbitMQChannelError(
        `publish: ${exchange}/${routingKey}`,
        cause,
      );
    }
  }

  async consume(
    queue: string,
    onMessage: (msg: amqplib.ConsumeMessage | null) => void,
    options?: amqplib.Options.Consume,
  ): Promise<amqplib.Replies.Consume> {
    try {
      const channel = await this.getChannel();
      return await channel.consume(queue, onMessage, options);
    } catch (cause) {
      throw new RabbitMQChannelError(`consume: ${queue}`, cause);
    }
  }

  async ack(message: amqplib.Message): Promise<void> {
    try {
      const channel = await this.getChannel();
      await channel.ack(message);
    } catch (cause) {
      throw new RabbitMQChannelError('ack', cause);
    }
  }

  async nack(message: amqplib.Message, allUpTo?: boolean): Promise<void> {
    try {
      const channel = await this.getChannel();
      await channel.nack(message, allUpTo, false);
    } catch (cause) {
      throw new RabbitMQChannelError('nack', cause);
    }
  }

  async prefetch(count: number): Promise<amqplib.Replies.Empty> {
    try {
      const channel = await this.getChannel();
      return await channel.prefetch(count);
    } catch (cause) {
      throw new RabbitMQChannelError('prefetch', cause);
    }
  }

  async close(): Promise<void> {
    if (this.channel) {
      await this.channel.close();
      this.channel = null;
    }
  }
}

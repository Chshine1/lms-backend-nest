import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import * as amqp from 'amqplib';
import { DomainEvent } from '../events/domain-event';

export interface RabbitMQConsumerConfig {
  host: string;
  port: number;
  username: string;
  password: string;
  exchangeName: string;
  queueName: string;
}

type EventHandler<T extends DomainEvent> = (event: T) => Promise<void>;

@Injectable()
export class RabbitMQEventConsumer implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RabbitMQEventConsumer.name);
  private connection: amqp.Connection | null = null;
  private channel: amqp.Channel | null = null;
  private readonly config: RabbitMQConsumerConfig;
  private readonly handlers = new Map<string, EventHandler<DomainEvent>[]>();
  private isConnected = false;

  constructor(config: RabbitMQConsumerConfig) {
    this.config = config;
  }

  async onModuleInit(): Promise<void> {
    await this.connect();
    await this.startConsuming();
  }

  async onModuleDestroy(): Promise<void> {
    await this.disconnect();
  }

  private async connect(): Promise<void> {
    try {
      const url = `amqp://${this.config.username}:${this.config.password}@${this.config.host}:${this.config.port}`;
      this.connection = await amqp.connect(url);
      this.channel = await this.connection.createChannel();

      await this.channel.assertExchange(this.config.exchangeName, 'topic', {
        durable: true,
      });

      await this.channel.assertQueue(this.config.queueName, {
        durable: true,
      });

      this.isConnected = true;
      this.logger.log(
        `Connected to RabbitMQ at ${this.config.host}:${this.config.port}`,
      );
    } catch (error) {
      this.logger.error('Failed to connect to RabbitMQ', error);
      throw error;
    }
  }

  private async disconnect(): Promise<void> {
    try {
      await this.channel?.close();
      await this.connection?.close();
      this.isConnected = false;
      this.logger.log('Disconnected from RabbitMQ');
    } catch (error) {
      this.logger.error('Error disconnecting from RabbitMQ', error);
    }
  }

  registerHandler<T extends DomainEvent>(
    eventConstructor: new (...args: unknown[]) => T,
    handler: EventHandler<T>,
  ): void {
    const eventType = eventConstructor.prototype.constructor.name;
    const existing = this.handlers.get(eventType) ?? [];
    existing.push(handler as EventHandler<DomainEvent>);
    this.handlers.set(eventType, existing);
    this.logger.debug(`Registered handler for event: ${eventType}`);
  }

  private async startConsuming(): Promise<void> {
    if (!this.channel) {
      throw new Error('Channel not initialized');
    }

    const boundEvents = Array.from(this.handlers.keys());
    for (const eventType of boundEvents) {
      const routingKey = eventType.toLowerCase();
      await this.channel.bindQueue(
        this.config.queueName,
        this.config.exchangeName,
        routingKey,
      );
    }

    await this.channel.consume(
      this.config.queueName,
      async (msg) => {
        if (!msg) return;

        try {
          const content = JSON.parse(msg.content.toString()) as DomainEvent;
          const eventType = content.eventType;
          const handlers = this.handlers.get(eventType) ?? [];

          for (const handler of handlers) {
            await handler(content);
          }

          this.channel?.ack(msg);
        } catch (error) {
          this.logger.error('Error processing message', error);
          this.channel?.nack(msg, false, false);
        }
      },
      { noAck: false },
    );

    this.logger.log(`Started consuming from queue: ${this.config.queueName}`);
  }
}

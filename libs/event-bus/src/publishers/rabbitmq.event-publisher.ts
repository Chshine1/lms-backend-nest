import {
  Injectable,
  Logger,
  OnModuleInit,
  OnModuleDestroy,
} from '@nestjs/common';
import * as amqp from 'amqplib';
import { DomainEvent, EventMetadata } from '../events/domain-event';
import { RemoteEventPublisher } from '../interfaces/event-bus-bridge.interface';

export interface RabbitMQPublisherConfig {
  host: string;
  port: number;
  username: string;
  password: string;
  exchangeName: string;
}

@Injectable()
export class RabbitMQEventPublisher
  implements RemoteEventPublisher, OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(RabbitMQEventPublisher.name);
  private connection: amqp.Connection | null = null;
  private channel: amqp.Channel | null = null;
  private readonly config: RabbitMQPublisherConfig;
  private readonly exchangeName: string;
  private isConnected = false;

  constructor(config: RabbitMQPublisherConfig) {
    this.config = config;
    this.exchangeName = config.exchangeName;
  }

  async onModuleInit(): Promise<void> {
    await this.connect();
  }

  async onModuleDestroy(): Promise<void> {
    await this.disconnect();
  }

  private async connect(): Promise<void> {
    try {
      const url = `amqp://${this.config.username}:${this.config.password}@${this.config.host}:${this.config.port}`;
      this.connection = await amqp.connect(url);
      this.channel = await this.connection.createChannel();

      await this.channel.assertExchange(this.exchangeName, 'topic', {
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

  async publishToExchange<T extends DomainEvent>(
    exchangeName: string,
    routingKey: string,
    event: T,
  ): Promise<void> {
    if (!this.isConnected || !this.channel) {
      this.logger.warn('RabbitMQ not connected, cannot publish event');
      return;
    }

    const payload = Buffer.from(JSON.stringify(event));

    this.channel.publish(exchangeName, routingKey, payload, {
      persistent: true,
      contentType: 'application/json',
      headers: {
        'x-event-type': event.eventType,
        'x-occurred-at': event.occurredAt.toISOString(),
      },
    });

    this.logger.debug(
      `Published event ${event.eventType} to ${exchangeName}/${routingKey}`,
    );
  }

  async publish<T extends DomainEvent>(event: T): Promise<void> {
    const routingKey = event.eventType.toLowerCase();
    await this.publishToExchange(this.exchangeName, routingKey, event);
  }
}

export class RabbitMQEventPublisherFactory {
  static create(config: RabbitMQPublisherConfig): RabbitMQEventPublisher {
    return new RabbitMQEventPublisher(config);
  }
}

import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { Channel, ChannelModel, connect } from 'amqplib';
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
  private connection: ChannelModel | null = null;
  private channel: Channel | null = null;
  private readonly config: RabbitMQConsumerConfig;
  private readonly handlers = new Map<string, EventHandler<DomainEvent>[]>();

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
      const url = `amqp://${this.config.username}:${this.config.password}@${this.config.host}:${String(this.config.port)}`;
      this.connection = await connect(url);
      this.channel = await this.connection.createChannel();

      await this.channel.assertExchange(this.config.exchangeName, 'topic', {
        durable: true,
      });

      await this.channel.assertQueue(this.config.queueName, {
        durable: true,
      });

      this.logger.log(
        `Connected to RabbitMQ at ${this.config.host}:${String(this.config.port)}`,
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
      this.logger.log('Disconnected from RabbitMQ');
    } catch (error) {
      this.logger.error('Error disconnecting from RabbitMQ', error);
    }
  }

  registerHandler<T extends DomainEvent>(
    eventConstructor: new (...args: unknown[]) => T,
    handler: EventHandler<T>,
  ): void {
    const eventType = eventConstructor.name;
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
      (message): void => {
        if (message === null) return;

        void (async (): Promise<void> => {
          try {
            const content = JSON.parse(
              message.content.toString(),
            ) as DomainEvent;
            const eventType = content.eventType;
            const handlers = this.handlers.get(eventType) ?? [];

            await Promise.all(handlers.map((handler) => handler(content)));

            this.channel?.ack(message);
          } catch (error) {
            this.logger.error('Error processing message', error);
            this.channel?.nack(message, false, false);
          }
        })();
      },
      { noAck: false },
    );

    this.logger.log(`Started consuming from queue: ${this.config.queueName}`);
  }
}

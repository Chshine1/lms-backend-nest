import { Injectable, OnModuleDestroy } from '@nestjs/common';
import * as amqplib from 'amqplib';
import type { RabbitMQConnectionOptions } from '@app/infrastructure/modules/rabbitmq/contracts/rabbitmq-options.interface';
import { RabbitMQConnectionError } from '@app/infrastructure/modules/rabbitmq/errors/rabbitmq-connection.error';

@Injectable()
export class RabbitMQConnectionService implements OnModuleDestroy {
  private connection: amqplib.ChannelModel | null = null;
  private readonly options: RabbitMQConnectionOptions;

  constructor(options: RabbitMQConnectionOptions) {
    this.options = options;
  }

  async connect(): Promise<amqplib.ChannelModel> {
    if (this.connection) {
      return this.connection;
    }

    const url = this.buildUrl();
    try {
      this.connection = await amqplib.connect(url, {
        heartbeat: this.options.heartbeat,
        timeout: this.options.timeout,
      });

      this.connection.on('error', () => {
        this.connection = null;
      });

      this.connection.on('close', () => {
        this.connection = null;
      });

      return this.connection;
    } catch (cause) {
      throw new RabbitMQConnectionError(
        this.options.host,
        this.options.port,
        cause,
      );
    }
  }

  async getConnection(): Promise<amqplib.ChannelModel> {
    if (!this.connection) {
      return this.connect();
    }
    return this.connection;
  }

  async close(): Promise<void> {
    if (this.connection) {
      await this.connection.close();
      this.connection = null;
    }
  }

  private buildUrl(): string {
    const { host, port, username, password, vhost } = this.options;
    const encodedPassword = encodeURIComponent(password);
    const vhostPath = vhost ? `/${encodeURIComponent(vhost)}` : '';
    return `amqp://${username}:${encodedPassword}@${host}:${port}${vhostPath}`;
  }

  async onModuleDestroy(): Promise<void> {
    await this.close();
  }
}

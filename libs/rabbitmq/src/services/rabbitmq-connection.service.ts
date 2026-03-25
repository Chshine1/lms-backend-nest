import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { ChannelModel, connect } from 'amqplib';
import type { RabbitMQConnectionOptions } from '../contracts/rabbitmq-options.interface';
import { RabbitMQConnectionError } from '../errors';

@Injectable()
export class RabbitMQConnectionService implements OnModuleDestroy {
  private connection: ChannelModel | null = null;
  private readonly options: RabbitMQConnectionOptions;

  constructor(options: RabbitMQConnectionOptions) {
    this.options = options;
  }

  async connect(): Promise<ChannelModel> {
    if (this.connection) {
      return this.connection;
    }

    const url = this.buildUrl();
    try {
      this.connection = await connect(url, {
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

  async getConnection(): Promise<ChannelModel> {
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
    return `amqp://${username}:${encodedPassword}@${host}:${port.toString()}${vhostPath}`;
  }

  async onModuleDestroy(): Promise<void> {
    await this.close();
  }
}

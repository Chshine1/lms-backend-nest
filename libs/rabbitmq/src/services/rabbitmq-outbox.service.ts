import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import type {
  RabbitMQMessageProperties,
  RabbitMQOutboxMessage,
} from '../contracts/rabbitmq-options.interface';
import { RabbitMQChannelService } from './rabbitmq-channel.service';
import { RabbitMQOutboxError } from '../errors/index';

export interface OutboxRepository {
  findPending(limit: number): Promise<RabbitMQOutboxMessage[]>;
  markProcessed(id: string): Promise<void>;
  incrementRetry(id: string): Promise<void>;
  save(message: RabbitMQOutboxMessage): Promise<void>;
}

@Injectable()
export class RabbitMQOutboxService {
  private isProcessing = false;
  private readonly pollInterval: number;
  private readonly maxRetries: number;
  private timer: ReturnType<typeof setInterval> | undefined;

  constructor(
    private readonly channelService: RabbitMQChannelService,
    private readonly outboxRepository: OutboxRepository,
    options?: {
      pollInterval?: number;
      maxRetries?: number;
    },
  ) {
    this.pollInterval = options?.pollInterval ?? 1000;
    this.maxRetries = options?.maxRetries ?? 3;
  }

  async addToOutbox(
    exchange: string,
    routingKey: string,
    content: Buffer,
    properties?: RabbitMQMessageProperties,
  ): Promise<string> {
    try {
      const message: RabbitMQOutboxMessage = {
        id: randomUUID(),
        exchange,
        routingKey,
        content,
        ...(properties !== undefined ? { properties } : {}),
        retryCount: 0,
        createdAt: new Date(),
      };

      await this.outboxRepository.save(message);
      return message.id;
    } catch (cause) {
      throw new RabbitMQOutboxError('addToOutbox', cause);
    }
  }

  async addJsonToOutbox(
    exchange: string,
    routingKey: string,
    data: unknown,
    properties?: RabbitMQMessageProperties,
  ): Promise<string> {
    const content = Buffer.from(JSON.stringify(data));
    return this.addToOutbox(exchange, routingKey, content, {
      contentType: 'application/json',
      ...properties,
    });
  }

  async processOutbox(limit = 10): Promise<number> {
    if (this.isProcessing) {
      return 0;
    }

    this.isProcessing = true;
    let processedCount = 0;

    try {
      const messages = await this.outboxRepository.findPending(limit);

      for (const msg of messages) {
        try {
          await this.channelService.publish(
            msg.exchange,
            msg.routingKey,
            msg.content,
            msg.properties,
          );

          await this.outboxRepository.markProcessed(msg.id);
          processedCount++;
        } catch {
          if (msg.retryCount >= this.maxRetries) {
            await this.outboxRepository.markProcessed(msg.id);
          } else {
            await this.outboxRepository.incrementRetry(msg.id);
          }
        }
      }

      return processedCount;
    } catch (cause) {
      throw new RabbitMQOutboxError('processOutbox', cause);
    } finally {
      this.isProcessing = false;
    }
  }

  startRelay(interval?: number): void {
    if (this.timer) {
      return;
    }

    const pollMs = interval ?? this.pollInterval;
    this.timer = setInterval(() => {
      void this.processOutbox().catch(() => {
        // Log but don't crash the relay
      });
    }, pollMs);
  }

  stopRelay(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = undefined;
    }
  }
}

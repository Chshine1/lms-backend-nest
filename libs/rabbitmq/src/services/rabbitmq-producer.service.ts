import { Injectable } from '@nestjs/common';
import type {
  RabbitMQMessageProperties,
  RabbitMQPublishOptions,
} from '../contracts/rabbitmq-options.interface';
import { RabbitMQChannelService } from './rabbitmq-channel.service';
import { RabbitMQPublishError } from '../errors';

@Injectable()
export class RabbitMQProducerService {
  constructor(private readonly channelService: RabbitMQChannelService) {}

  async publish(options: RabbitMQPublishOptions): Promise<boolean> {
    try {
      return await this.channelService.publish(
        options.exchange,
        options.routingKey,
        options.content,
        options.properties
          ? {
              contentType: options.properties.contentType ?? 'application/json',
              contentEncoding: options.properties.contentEncoding,
              headers: options.properties.headers,
              deliveryMode: options.properties.deliveryMode ?? 2,
              priority: options.properties.priority,
              correlationId: options.properties.correlationId,
              replyTo: options.properties.replyTo,
              expiration: options.properties.expiration,
              messageId: options.properties.messageId,
              timestamp: options.properties.timestamp,
              type: options.properties.type,
              userId: options.properties.userId,
              appId: options.properties.appId,
            }
          : undefined,
      );
    } catch (cause) {
      throw new RabbitMQPublishError(
        options.exchange,
        options.routingKey,
        cause,
      );
    }
  }

  async publishJson(
    exchange: string,
    routingKey: string,
    data: unknown,
    properties?: RabbitMQMessageProperties,
  ): Promise<boolean> {
    const content = Buffer.from(JSON.stringify(data));
    return this.publish({
      exchange,
      routingKey,
      content,
      properties: {
        contentType: 'application/json',
        ...properties,
      },
    });
  }

  async publishEvent(
    exchange: string,
    eventType: string,
    payload: unknown,
    options?: Partial<RabbitMQMessageProperties>,
  ): Promise<boolean> {
    return this.publishJson(exchange, eventType, payload, {
      type: eventType,
      timestamp: Date.now(),
      ...options,
    });
  }
}

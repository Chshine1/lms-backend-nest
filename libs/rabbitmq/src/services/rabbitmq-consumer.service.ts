import { Injectable } from '@nestjs/common';
import { Replies } from 'amqplib';
import type {
  RabbitMQConsumerOptions,
  RabbitMQMessage,
} from '@app/rabbitmq/contracts/rabbitmq-options.interface';
import { RabbitMQChannelService } from '@app/rabbitmq/services/rabbitmq-channel.service';
import { RabbitMQConsumeError } from '@app/rabbitmq/errors/rabbitmq-consume.error';

@Injectable()
export class RabbitMQConsumerService {
  private consumers: Map<string, Replies.Consume> = new Map();

  constructor(private readonly channelService: RabbitMQChannelService) {}

  async startConsuming(options: RabbitMQConsumerOptions): Promise<void> {
    if (this.consumers.has(options.queue)) {
      return;
    }

    try {
      if (options.prefetch) {
        await this.channelService.prefetch(options.prefetch);
      }

      const result = await this.channelService.consume(
        options.queue,
        async (msg): Promise<void> => {
          if (!msg) {
            return;
          }

          const props = msg.properties;
          const message: RabbitMQMessage = {
            content: msg.content,
            fields: {
              deliveryTag: msg.fields.deliveryTag,
              redelivered: msg.fields.redelivered,
              exchange: msg.fields.exchange,
              routingKey: msg.fields.routingKey,
            },
            properties: {
              ...(props.contentType !== undefined
                ? { contentType: props.contentType }
                : {}),
              ...(props.contentEncoding !== undefined
                ? { contentEncoding: props.contentEncoding }
                : {}),
              ...(props.headers !== undefined
                ? { headers: props.headers as Record<string, unknown> }
                : {}),
              ...(props.deliveryMode !== undefined
                ? { deliveryMode: props.deliveryMode as 1 | 2 }
                : {}),
              ...(props.priority !== undefined
                ? { priority: props.priority }
                : {}),
              ...(props.correlationId !== undefined
                ? { correlationId: props.correlationId }
                : {}),
              ...(props.replyTo !== undefined
                ? { replyTo: props.replyTo }
                : {}),
              ...(props.expiration !== undefined
                ? { expiration: props.expiration }
                : {}),
              ...(props.messageId !== undefined
                ? { messageId: props.messageId }
                : {}),
              ...(props.timestamp !== undefined
                ? { timestamp: props.timestamp }
                : {}),
              ...(props.type !== undefined ? { type: props.type } : {}),
              ...(props.userId !== undefined ? { userId: props.userId } : {}),
              ...(props.appId !== undefined ? { appId: props.appId } : {}),
            },
          };

          try {
            await options.handler(message);
            await this.channelService.ack(msg);
          } catch {
            await this.channelService.nack(msg, false);
          }
        },
        {
          noAck: options.noAck ?? false,
          exclusive: options.exclusive,
          arguments: options.args,
        },
      );

      this.consumers.set(options.queue, result);
    } catch (cause) {
      throw new RabbitMQConsumeError(options.queue, cause);
    }
  }

  async stopConsuming(queue: string): Promise<void> {
    this.consumers.delete(queue);
  }

  isConsuming(queue: string): boolean {
    return this.consumers.has(queue);
  }

  parseMessage<T>(msg: RabbitMQMessage): T | null {
    try {
      return JSON.parse(msg.content.toString()) as T;
    } catch {
      return null;
    }
  }
}

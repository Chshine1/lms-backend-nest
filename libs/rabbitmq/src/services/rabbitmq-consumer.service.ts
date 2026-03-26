import { Injectable } from '@nestjs/common';
import { ConsumeMessage, Replies } from 'amqplib';
import type {
  RabbitMQConsumerOptions,
  RabbitMQMessage,
} from '../contracts/rabbitmq-options.interface';
import { RabbitMQChannelService } from './rabbitmq-channel.service';
import { RabbitMQConsumeError } from '../errors';

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
        (msg: ConsumeMessage | null): void => {
          const promise = async (): Promise<void> => {
            if (!msg) {
              return;
            }

            const props = msg.properties;
            const messageProperties: RabbitMQMessage['properties'] = {};

            if (props.contentType !== undefined) {
              messageProperties.contentType = props.contentType as string;
            }
            if (props.contentEncoding !== undefined) {
              messageProperties.contentEncoding =
                props.contentEncoding as string;
            }
            if (props.headers !== undefined) {
              messageProperties.headers = props.headers as Record<
                string,
                unknown
              >;
            }
            if (props.deliveryMode !== undefined) {
              messageProperties.deliveryMode = props.deliveryMode as 1 | 2;
            }
            if (props.priority !== undefined) {
              messageProperties.priority = props.priority as number;
            }
            if (props.correlationId !== undefined) {
              messageProperties.correlationId = props.correlationId as string;
            }
            if (props.replyTo !== undefined) {
              messageProperties.replyTo = props.replyTo as string;
            }
            if (props.expiration !== undefined) {
              messageProperties.expiration = props.expiration as string;
            }
            if (props.messageId !== undefined) {
              messageProperties.messageId = props.messageId as string;
            }
            if (props.timestamp !== undefined) {
              messageProperties.timestamp = props.timestamp as number;
            }
            if (props.type !== undefined) {
              messageProperties.type = props.type as string;
            }
            if (props.userId !== undefined) {
              messageProperties.userId = props.userId as string;
            }
            if (props.appId !== undefined) {
              messageProperties.appId = props.appId as string;
            }

            const message: RabbitMQMessage = {
              content: msg.content,
              fields: {
                deliveryTag: msg.fields.deliveryTag,
                redelivered: msg.fields.redelivered,
                exchange: msg.fields.exchange,
                routingKey: msg.fields.routingKey,
              },
              properties: messageProperties,
            };

            try {
              await options.handler(message);
              await this.channelService.ack(msg);
            } catch {
              await this.channelService.nack(msg, false);
            }
          };
          void promise();
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

  stopConsuming(queue: string): Promise<void> {
    this.consumers.delete(queue);
    return Promise.resolve();
  }

  isConsuming(queue: string): boolean {
    return this.consumers.has(queue);
  }

  parseMessage(msg: RabbitMQMessage): unknown {
    try {
      return JSON.parse(msg.content.toString());
    } catch {
      return null as unknown;
    }
  }
}

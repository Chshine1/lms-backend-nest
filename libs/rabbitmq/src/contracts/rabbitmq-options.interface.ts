import { Buffer } from 'buffer';

export interface RabbitMQConnectionOptions {
  host: string;
  port: number;
  username: string;
  password: string;
  vhost?: string;
  heartbeat?: number;
  timeout?: number;
}

export interface RabbitMQExchangeOptions {
  name: string;
  type: 'direct' | 'fanout' | 'topic' | 'headers';
  durable?: boolean;
  autoDelete?: boolean;
  arguments?: Record<string, unknown>;
}

export interface RabbitMQQueueOptions {
  name: string;
  durable?: boolean;
  exclusive?: boolean;
  autoDelete?: boolean;
  arguments?: Record<string, unknown>;
}

export interface RabbitMQBindingOptions {
  source: string;
  target: string;
  routingKey?: string;
  arguments?: Record<string, unknown>;
}

export interface RabbitMQPublishOptions {
  exchange: string;
  routingKey: string;
  content: Buffer;
  properties?: Partial<RabbitMQMessageProperties>;
}

export interface RabbitMQMessageProperties {
  contentType?: string;
  contentEncoding?: string;
  headers?: Record<string, unknown>;
  deliveryMode?: 1 | 2;
  priority?: number;
  correlationId?: string;
  replyTo?: string;
  expiration?: string;
  messageId?: string;
  timestamp?: number;
  type?: string;
  userId?: string;
  appId?: string;
}

export interface RabbitMQConsumeOptions {
  queue: string;
  prefetch?: number;
  noAck?: boolean;
  exclusive?: boolean;
  args?: Record<string, unknown>;
}

export interface RabbitMQMessage {
  content: Buffer;
  fields: RabbitMQMessageFields;
  properties: Partial<RabbitMQMessageProperties>;
}

export interface RabbitMQMessageFields {
  deliveryTag: number;
  redelivered: boolean;
  exchange: string;
  routingKey: string;
}

export interface RabbitMQOutboxMessage {
  id: string;
  exchange: string;
  routingKey: string;
  content: Buffer;
  properties?: Partial<RabbitMQMessageProperties>;
  retryCount: number;
  createdAt: Date;
  processedAt?: Date;
}

export type RabbitMQConsumerHandler = (
  msg: RabbitMQMessage,
) => Promise<void> | void;

export interface RabbitMQConsumerOptions {
  queue: string;
  handler: RabbitMQConsumerHandler;
  prefetch?: number;
  noAck?: boolean;
  exclusive?: boolean;
  args?: Record<string, unknown>;
}

import { DynamicModule, Global, Module } from '@nestjs/common';
import type { RabbitMQConnectionOptions } from './contracts/rabbitmq-options.interface';
import { RabbitMQConnectionService } from './services/rabbitmq-connection.service';
import { RabbitMQChannelService } from './services/rabbitmq-channel.service';
import { RabbitMQProducerService } from './services/rabbitmq-producer.service';
import { RabbitMQConsumerService } from './services/rabbitmq-consumer.service';
import { RabbitMQOutboxService } from './services/rabbitmq-outbox.service';

export interface RabbitMQModuleOptions {
  connection: RabbitMQConnectionOptions;
}

export const RABBITMQ_MODULE_OPTIONS = Symbol('RABBITMQ_MODULE_OPTIONS');

@Module({})
@Global()
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class RabbitMQModule {
  static forRoot(options: RabbitMQModuleOptions): DynamicModule {
    return {
      module: RabbitMQModule,
      providers: [
        {
          provide: RABBITMQ_MODULE_OPTIONS,
          useValue: options,
        },
        RabbitMQOutboxService,
        RabbitMQConnectionService,
        RabbitMQChannelService,
        RabbitMQProducerService,
        RabbitMQConsumerService,
      ],
      exports: [
        RabbitMQOutboxService,
        RabbitMQConnectionService,
        RabbitMQChannelService,
        RabbitMQProducerService,
        RabbitMQConsumerService,
      ],
    };
  }
}

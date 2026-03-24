import { DynamicModule, Global, Module } from '@nestjs/common';
import type { RabbitMQConnectionOptions } from '@app/rabbitmq/contracts/rabbitmq-options.interface';
import { RabbitMQConnectionService } from '@app/rabbitmq/services/rabbitmq-connection.service';
import { RabbitMQChannelService } from '@app/rabbitmq/services/rabbitmq-channel.service';
import { RabbitMQProducerService } from '@app/rabbitmq/services/rabbitmq-producer.service';
import { RabbitMQConsumerService } from '@app/rabbitmq/services/rabbitmq-consumer.service';

export interface RabbitMQModuleOptions {
  connection: RabbitMQConnectionOptions;
}

export const RABBITMQ_MODULE_OPTIONS = Symbol('RABBITMQ_MODULE_OPTIONS');

@Module({})
@Global()
export class RabbitMQModule {
  static forRoot(options: RabbitMQModuleOptions): DynamicModule {
    return {
      module: RabbitMQModule,
      providers: [
        {
          provide: RABBITMQ_MODULE_OPTIONS,
          useValue: options,
        },
        RabbitMQConnectionService,
        RabbitMQChannelService,
        RabbitMQProducerService,
        RabbitMQConsumerService,
      ],
      exports: [
        RabbitMQConnectionService,
        RabbitMQChannelService,
        RabbitMQProducerService,
        RabbitMQConsumerService,
      ],
    };
  }
}

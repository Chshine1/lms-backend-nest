import { DynamicModule, Global, Module } from '@nestjs/common';
import { EventBusService } from './event-bus.service';
import {
  RabbitMQEventPublisher,
  RabbitMQPublisherConfig,
} from './publishers/rabbitmq.event-publisher';
import {
  RabbitMQEventConsumer,
  RabbitMQConsumerConfig,
} from './consumers/rabbitmq.event-consumer';
import { InMemoryEventPublisher } from './publishers/in-memory.event-publisher';
import { ConfigurationService } from '@app/infrastructure';
import { RabbitMQConfig } from '@app/contracts';

export interface EventBusModuleOptions {
  enableRabbitMQ: boolean;
}

@Global()
@Module({})
export class EventBusModule {
  static forRoot(options: EventBusModuleOptions): DynamicModule {
    return {
      module: EventBusModule,
      providers: [
        EventBusService,
        InMemoryEventPublisher,
        ...(options.enableRabbitMQ
          ? [
              {
                provide: RabbitMQEventPublisher,
                useFactory: (
                  configService: ConfigurationService,
                ): RabbitMQEventPublisher => {
                  const config = configService.getByKey(
                    'rabbitmq',
                    RabbitMQConfig,
                  );
                  const publisherConfig: RabbitMQPublisherConfig = {
                    host: config.host,
                    port: config.port,
                    username: config.username,
                    password: config.password,
                    exchangeName: config.eventExchange,
                  };
                  return new RabbitMQEventPublisher(publisherConfig);
                },
                inject: [ConfigurationService],
              },
              {
                provide: RabbitMQEventConsumer,
                useFactory: (
                  configService: ConfigurationService,
                ): RabbitMQEventConsumer => {
                  const config = configService.getByKey(
                    'rabbitmq',
                    RabbitMQConfig,
                  );
                  const consumerConfig: RabbitMQConsumerConfig = {
                    host: config.host,
                    port: config.port,
                    username: config.username,
                    password: config.password,
                    exchangeName: config.eventExchange,
                    queueName: config.eventQueue,
                  };
                  return new RabbitMQEventConsumer(consumerConfig);
                },
                inject: [ConfigurationService],
              },
            ]
          : []),
      ],
      exports: [
        EventBusService,
        InMemoryEventPublisher,
        ...(options.enableRabbitMQ
          ? [RabbitMQEventPublisher, RabbitMQEventConsumer]
          : []),
      ],
    };
  }
}

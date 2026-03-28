import { DynamicModule, Global, Module } from '@nestjs/common';
import { ClassConstructor } from 'class-transformer';
import { TypedClientBase } from './typed-client.base';
import { TraceModule } from '@app/trace';
import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import {
  ConfigurationService,
  InfrastructureModule,
} from '@app/infrastructure';
import { RabbitMQConfig } from '@app/infrastructure';

export interface TypedClientMqOptions {
  exchange: string;
  timeout?: number;
}

export const TYPED_CLIENT_MQ_OPTIONS = Symbol('TYPED_CLIENT_MQ_OPTIONS');

@Global()
@Module({})
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class TypedClientModule {
  static forRoot(mqExchanges: { name: string; type: string }[]): DynamicModule {
    const rabbitMQImports: DynamicModule[] = [];

    if (mqExchanges.length > 0) {
      rabbitMQImports.push(
        RabbitMQModule.forRootAsync({
          useFactory: (configService: ConfigurationService) => {
            const section = configService.getByKey('rabbitmq', RabbitMQConfig);
            return {
              exchanges: mqExchanges.map((exchange) => ({
                name: exchange.name,
                type: exchange.type,
              })),
              uri: `amqp://${section.username}:${section.password}@${section.host}:${section.port.toString()}`,
              connectionInitOptions: { wait: true },
            };
          },
          inject: [ConfigurationService],
        }),
      );
    }

    return {
      module: TypedClientModule,
      imports: [InfrastructureModule, ...rabbitMQImports, TraceModule],
      providers: [],
      exports: [
        ...(mqExchanges.length === 0 ? [] : [RabbitMQModule]),
        TraceModule,
      ],
    };
  }

  static forFeature(config: {
    mqOptions: TypedClientMqOptions;
    clients: ClassConstructor<TypedClientBase>[];
  }): DynamicModule {
    return {
      module: TypedClientModule,
      imports: [],
      providers: [
        {
          provide: TYPED_CLIENT_MQ_OPTIONS,
          useValue: config.mqOptions,
        },
        ...config.clients,
      ],
      exports: [...config.clients],
    };
  }
}

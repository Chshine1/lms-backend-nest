import { DynamicModule, Module } from '@nestjs/common';
import { ClassConstructor } from 'class-transformer';
import { TypedClientBase } from './typed-client.base';
import { TraceModule, TraceService } from '@app/trace';
import { AmqpConnection, RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import {
  ConfigurationService,
  InfrastructureModule,
} from '@app/infrastructure';
import { RabbitMQConfig } from '@app/contracts';
import { AuthenticationModule } from '@app/authentication';

interface ForFeatureOptions {
  client: ClassConstructor<TypedClientBase>;
  mqOptions: {
    exchange: string;
  };
}

@Module({})
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class TypedClientModule {
  static forRoot(mqExchanges: { name: string; type: string }[]): DynamicModule {
    return {
      module: TypedClientModule,
      imports: [
        AuthenticationModule,
        TraceModule,
        RabbitMQModule.forRootAsync({
          imports: [InfrastructureModule],
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
      ],
    };
  }

  static forFeature(configs: ForFeatureOptions[]): DynamicModule {
    const providers = configs.flatMap((config) => [
      {
        provide: config.client,
        useFactory: (
          amqpConnection: AmqpConnection,
          traceService: TraceService,
        ): TypedClientBase => {
          return new config.client(
            amqpConnection,
            traceService,
            config.mqOptions,
          );
        },
        inject: [AmqpConnection, TraceService],
      },
    ]);

    const exports = configs.map((c) => c.client);

    return {
      module: TypedClientModule,
      providers,
      exports,
    };
  }
}

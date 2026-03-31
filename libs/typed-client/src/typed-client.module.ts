import { DynamicModule, Module } from '@nestjs/common';
import { ClassConstructor } from 'class-transformer';
import { TypedClientBase } from './typed-client.base';
import { TraceService } from '@app/trace';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { TypedClientCoreModule } from './typed-client.core.module';

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
      imports: [TypedClientCoreModule.forRoot(mqExchanges)],
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
      imports: [TypedClientCoreModule],
      providers,
      exports,
    };
  }
}

import { DynamicModule, Module, Provider } from '@nestjs/common';
import { ClassConstructor } from 'class-transformer';
import { TypedClientBase } from './typed-client.base';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { TypedClientCoreModule } from './typed-client.core.module';
import { AuthenticationModule, UserContextService } from '@app/authentication';

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
    const providers: Provider[] = configs.flatMap((config) => [
      {
        provide: config.client,
        // Pay attention to constructor here, not strong-typed, so no compiling checks
        useFactory: (
          amqpConnection: AmqpConnection,
          userContextService: UserContextService,
        ): TypedClientBase => {
          return new config.client(
            amqpConnection,
            userContextService,
            config.mqOptions,
          );
        },
        inject: [AmqpConnection, UserContextService],
      },
    ]);

    const exports = configs.map((c) => c.client);

    return {
      module: TypedClientModule,
      imports: [AuthenticationModule],
      providers,
      exports,
    };
  }
}

import { DynamicModule, Module } from '@nestjs/common';
import { TraceModule } from '@app/trace';
import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import {
  ConfigurationService,
  InfrastructureModule,
} from '@app/infrastructure';
import { RabbitMQConfig } from '@app/contracts';
import { AuthenticationModule } from '@app/authentication';

@Module({})
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class TypedClientCoreModule {
  static forRoot(mqExchanges: { name: string; type: string }[]): DynamicModule {
    return {
      module: TypedClientCoreModule,
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
      exports: [AuthenticationModule, TraceModule, RabbitMQModule],
    };
  }
}

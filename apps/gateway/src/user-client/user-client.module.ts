import { Module } from '@nestjs/common';
import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { TypedClientModule, UserTypedClient } from '@app/typed-client';
import { ConfigurationService } from '@app/infrastructure';
import { IsDefined, IsNumber, IsString } from 'class-validator';
import { Expose } from 'class-transformer';

class RabbitMQConfigSection {
  @IsString()
  @IsDefined()
  @Expose()
  host!: string;

  @IsNumber()
  @IsDefined()
  @Expose()
  port!: number;

  @IsString()
  @IsDefined()
  @Expose()
  username!: string;

  @IsString()
  @IsDefined()
  @Expose()
  password!: string;
}

@Module({
  imports: [
    RabbitMQModule.forRootAsync({
      useFactory: (configService: ConfigurationService) => {
        const section = configService.get(RabbitMQConfigSection);
        return {
          uri: `amqp://${section.username}:${section.password}@${section.host}:${section.port.toString()}`,
          connectionInitOptions: { wait: true },
        };
      },
      inject: [ConfigurationService],
    }),
    TypedClientModule.forFeature({
      mqOptions: {
        exchange: 'user-service',
      },
      clients: [UserTypedClient],
    }),
  ],
  exports: [UserTypedClient],
})
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class UserClientModule {}

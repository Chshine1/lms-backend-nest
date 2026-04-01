import { DynamicModule, Module, Provider } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RabbitMQModule } from '@app/rabbitmq';
import { HealthController } from './health.controller';
import { DatabaseHealthIndicator } from './indicators/database.health';
import { RabbitMqHealthIndicator } from './indicators/rabbitmq.health';
import { HealthModuleConfig } from './health-module.config';

@Module({})
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class HealthModule {
  static forRoot(config: HealthModuleConfig): DynamicModule {
    const providers: Provider[] = [
      {
        provide: HealthModuleConfig,
        useValue: config,
      },
      DatabaseHealthIndicator,
      RabbitMqHealthIndicator,
    ];

    const imports: (typeof TypeOrmModule | typeof RabbitMQModule)[] = [
      TypeOrmModule,
    ];

    if (config.rabbitmq) {
      imports.push(RabbitMQModule);
    }

    return {
      module: HealthModule,
      imports,
      controllers: [HealthController],
      providers,
      exports: providers,
    };
  }
}

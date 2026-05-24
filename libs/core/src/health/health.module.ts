import { DynamicModule, Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { HealthController } from './health.controller';
import { DatabaseHealthIndicator } from './indicators/database.health';
import { RabbitMQHealthIndicator } from './indicators/rabbitmq.health';
import { TerminusModule } from '@nestjs/terminus';
import { TypedClientCoreModule } from '@app/typed-client';

@Module({
  // imports: [MikroOrmModule, TypedClientCoreModule, TerminusModule],
  // controllers: [HealthController],
  // providers: [DatabaseHealthIndicator, RabbitMQHealthIndicator],
})
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class HealthModule {

  static forRoot(withDatabase: boolean = true): DynamicModule {
    const imports: any[] = [TerminusModule, TypedClientCoreModule];
    const providers: any[] = [RabbitMQHealthIndicator];
    const controllers: any[] = [HealthController];

    if(withDatabase) {
      imports.push(MikroOrmModule);
      providers.push(DatabaseHealthIndicator);
    }

    return{
      module: HealthModule,
      imports,
      controllers,
      providers,
    };
  }
}

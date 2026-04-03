import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HealthController } from './health.controller';
import { DatabaseHealthIndicator } from './indicators/database.health';
import { RabbitMQHealthIndicator } from './indicators/rabbitmq.health';
import { TerminusModule } from '@nestjs/terminus';
import { TypedClientCoreModule } from '@app/typed-client/typed-client.core.module';

@Module({
  imports: [TypeOrmModule, TypedClientCoreModule, TerminusModule],
  controllers: [HealthController],
  providers: [DatabaseHealthIndicator, RabbitMQHealthIndicator],
})
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class HealthModule {}

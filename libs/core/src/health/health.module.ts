import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HealthController } from './health.controller';
import { DatabaseHealthIndicator } from './indicators/database.health';
import { RabbitMQHealthIndicator } from './indicators/rabbitmq.health';
import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { TerminusModule } from '@nestjs/terminus';

@Module({
  imports: [TypeOrmModule, RabbitMQModule, TerminusModule],
  controllers: [HealthController],
  providers: [DatabaseHealthIndicator, RabbitMQHealthIndicator],
})
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class HealthModule {}

import { Module } from '@nestjs/common';
import { EventBusModule } from '../event-bus/event-bus.module';
import { ConfigurationModule } from '../configuration/configuration.module';
import { LoggerModule } from '../logger/logger.module';
import { TraceModule } from '@app/trace';

@Module({
  imports: [EventBusModule, TraceModule, ConfigurationModule, LoggerModule],
})
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class BootstrapModule {}

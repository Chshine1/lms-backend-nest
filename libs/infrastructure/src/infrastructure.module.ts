import { DynamicModule, Global, Module } from '@nestjs/common';
import { ConfigurationModule } from './modules/configuration/configuration.module';
import { LoggerModule } from './modules/logger/logger.module';
import { ConfigurationService } from './modules/configuration/configuration.service';
import { LoggerService } from './modules/logger/logger.service';
import { InfrastructureService } from '@app/infrastructure/infrastructure.service';

@Module({})
@Global()
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class InfrastructureModule {
  static forRootAsync(): DynamicModule {
    return {
      module: InfrastructureModule,
      imports: [ConfigurationModule, LoggerModule],
      providers: [InfrastructureService],
      exports: [ConfigurationService, LoggerService],
    };
  }
}

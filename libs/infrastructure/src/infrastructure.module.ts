import { DynamicModule, Global, Module } from '@nestjs/common';
import { ConfigurationModule } from './modules/configuration/configuration.module';

@Module({})
@Global()
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class InfrastructureModule {
  static forRoot(): DynamicModule {
    return {
      module: InfrastructureModule,
      imports: [ConfigurationModule],
      exports: [ConfigurationModule],
    };
  }
}

import { DynamicModule, Global, Module } from '@nestjs/common';

@Module({})
@Global()
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class InfrastructureModule {
  static forRoot(): DynamicModule {
    return {
      module: InfrastructureModule,
      providers: [],
    };
  }
}

import { DynamicModule, Module } from '@nestjs/common';

export const BootstrapEventBusSymbol = Symbol('EVENT_BUS');

@Module({})
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class InfrastructureModule {
  static forRoot(): DynamicModule {
    return {
      module: InfrastructureModule,
      providers: [],
    };
  }
}

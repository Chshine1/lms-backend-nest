import { DynamicModule, Module, Provider } from '@nestjs/common';
import mitt from 'mitt';

export type BootstrapEvents = {
  'config.loaded': Record<string, unknown>;
};

export const BootstrapEventBusSymbol = Symbol('EVENT_BUS');

@Module({})
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class InfrastructureModule {
  static forRoot(): DynamicModule {
    const eventBusProvider: Provider = {
      provide: BootstrapEventBusSymbol,
      useValue: mitt<BootstrapEvents>(),
    };
    return {
      module: InfrastructureModule,
      providers: [eventBusProvider],
    };
  }
}

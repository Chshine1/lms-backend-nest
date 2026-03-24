import { DynamicModule, Global, Module } from '@nestjs/common';

export interface TypedClientModuleOptions {
  exchange: string;
  timeout?: number;
}

export const TYPED_CLIENT_MODULE_OPTIONS = Symbol(
  'TYPED_CLIENT_MODULE_OPTIONS',
);

@Global()
@Module({})
export class TypedClientModule {
  static forFeature(options: TypedClientModuleOptions): DynamicModule {
    return {
      module: TypedClientModule,
      providers: [
        {
          provide: TYPED_CLIENT_MODULE_OPTIONS,
          useValue: options,
        },
      ],
      exports: [TYPED_CLIENT_MODULE_OPTIONS],
    };
  }
}

export { AmqpConnection } from '@golevelup/nestjs-rabbitmq';

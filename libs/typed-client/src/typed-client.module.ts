import { DynamicModule, Global, Module } from '@nestjs/common';
import { ClassConstructor } from 'class-transformer';
import { TypedClientBase } from './typed-client.base';

export interface TypedClientMqOptions {
  exchange: string;
  timeout?: number;
}

export const TYPED_CLIENT_MQ_OPTIONS = Symbol('TYPED_CLIENT_MQ_OPTIONS');

@Global()
@Module({})
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class TypedClientModule {
  static forFeature(config: {
    mqOptions: TypedClientMqOptions;
    clients: ClassConstructor<TypedClientBase>[];
  }): DynamicModule {
    return {
      module: TypedClientModule,
      providers: [
        {
          provide: TYPED_CLIENT_MQ_OPTIONS,
          useValue: config.mqOptions,
        },
        ...config.clients,
      ],
      exports: [...config.clients],
    };
  }
}

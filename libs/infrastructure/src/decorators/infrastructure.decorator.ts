import { Type } from '@nestjs/common';

export interface InfrastructureMetadata {
  bootstrap: Type<unknown>;
  runtime: Type<unknown>;
  bootstrapDeps: Type<unknown>[];
  runtimeDeps: Type<unknown>[];
}

const INFRASTRUCTURE_METADATA_KEY = Symbol('lib:infrastructure:metadata');

export function Infrastructure(
  metadata: InfrastructureMetadata,
): ClassDecorator {
  return (target: object) => {
    Reflect.defineMetadata(INFRASTRUCTURE_METADATA_KEY, metadata, target);
  };
}

export function getInfrastructureMetadata(
  moduleClass: Type<unknown>,
): InfrastructureMetadata | undefined {
  return Reflect.getMetadata(INFRASTRUCTURE_METADATA_KEY, moduleClass) as
    | InfrastructureMetadata
    | undefined;
}

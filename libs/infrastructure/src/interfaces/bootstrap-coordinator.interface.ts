import { Type } from '@nestjs/common';

export interface IBootstrapCoordinator {
  registerInfrastructureModule(moduleClass: Type): void;

  bootstrap(): Promise<void>;

  upgrade(moduleClass: Type, runtimeInstance: unknown): Promise<void>;

  isUpgraded(moduleClass: Type): boolean;

  getCurrentImplementation(moduleClass: Type): unknown;

  on(event: string, listener: (...args: unknown[]) => void): void;

  off(event: string, listener: (...args: unknown[]) => void): void;

  emit(event: string, ...args: unknown[]): void;
}

export enum InfrastructureModuleState {
  PENDING = 'pending',
  BOOTSTRAPPED = 'bootstrapped',
  UPGRADED = 'upgraded',
  ERROR = 'error',
}

export interface ModuleStateInfo {
  moduleClass: Type;
  state: InfrastructureModuleState;
  bootstrapInstance?: unknown;
  runtimeInstance?: unknown;
  error?: Error;
}

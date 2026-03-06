import { ClassConstructor } from 'class-transformer';

export interface IIoCContainer {
  register<T>(
    token: string | ClassConstructor<T>,
    factory: ClassConstructor<T> | (() => T),
  ): void;
  resolve<T>(token: string | ClassConstructor<T>): T;
}

export interface IEventBus {
  on(eventName: string, listener: (...args: unknown[]) => unknown): void;
  emit(eventName: string, ...args: unknown[]): unknown;
}

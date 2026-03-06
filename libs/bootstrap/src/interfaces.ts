import { ClassConstructor } from 'class-transformer';
import { AbstractConstructor } from '@app/bootstrap/decorators';

export interface IIoCContainer {
  register<T>(
    token: AbstractConstructor<T>,
    factory: ClassConstructor<T> | (() => T),
  ): void;
  resolve<T>(token: AbstractConstructor<T>): T;
}

export interface IEventBus {
  on(eventName: string, listener: (...args: unknown[]) => unknown): void;
  emit(eventName: string, ...args: unknown[]): unknown;
}

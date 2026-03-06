import { ClassConstructor } from 'class-transformer';
import { AbstractConstructor } from '@app/bootstrap/decorators';

/**
 * Interface for an Inversion of Control container.
 * Allows registering and resolving dependencies by abstract class tokens.
 */
export interface IIoCContainer {
  /**
   * Registers a token with either a concrete class constructor or a factory function.
   * @param token - The abstract class token.
   * @param factory - The implementation constructor or a factory that returns an instance.
   */
  register<T>(
    token: AbstractConstructor<T>,
    factory: ClassConstructor<T> | (() => T),
  ): void;

  /** Resolves an instance for the given token. */
  resolve<T>(token: AbstractConstructor<T>): T;
}

/**
 * Simple event bus interface for emitting and listening to events.
 */
export interface IEventBus {
  on(eventName: string, listener: (...args: unknown[]) => unknown): void;
  emit(eventName: string, ...args: unknown[]): unknown;
}

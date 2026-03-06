import 'reflect-metadata';
import { ClassConstructor } from 'class-transformer';
import { IIoCContainer, IEventBus } from './interfaces';
import {
  AbstractConstructor,
  extractBootstrapToken,
  extractExposeToMethodMap,
  extractMethodToExposeMap,
} from '@app/bootstrap/decorators';

/**
 * Core class that bridges abstraction proxies with concrete implementations via an event bus.
 * It maintains a set of event listeners and proxies for abstract classes.
 * When an implementation is registered, it sets up listeners that delegate calls to the real instance.
 */
export class BootstrapCore implements IEventBus {
  // Map of event names to listener functions
  private eventListeners = new Map<string, (...args: unknown[]) => unknown>();
  // Cache of created proxies for abstract classes
  private abstractProxies = new Map<AbstractConstructor<unknown>, unknown>();
  // Tracks which events are registered for each abstract class (for cleanup)
  private registeredEvents = new Map<
    AbstractConstructor<unknown>,
    Set<string>
  >();

  constructor(private ioc: IIoCContainer) {}

  /** Registers an event listener. */
  on(eventName: string, listener: (...args: unknown[]) => unknown): void {
    this.eventListeners.set(eventName, listener);
  }

  /** Emits an event, invoking its listener with given arguments. */
  emit(eventName: string, ...args: unknown[]): unknown {
    const listener = this.eventListeners.get(eventName);
    if (!listener) {
      throw new Error(`No listener for event ${eventName}`);
    }
    return listener(...args);
  }

  /**
   * Registers an abstract class by creating a proxy for it.
   * The proxy converts calls to exposed methods into events.
   * @param abstractClass - The abstract class to proxy.
   */
  registerAbstract<T extends object>(
    abstractClass: AbstractConstructor<T>,
  ): void {
    const token = this.getToken(abstractClass);
    if (!token) {
      throw new Error(
        `Token not defined for abstract class ${abstractClass.name}`,
      );
    }

    if (this.abstractProxies.has(abstractClass)) return;

    const proxy = this.createProxyForAbstract(abstractClass, token);
    this.abstractProxies.set(abstractClass, proxy);
    // Register the proxy as a factory in the IoC container
    this.ioc.register(abstractClass, () => proxy);
  }

  /**
   * Registers a concrete implementation for an abstract class.
   * This sets up event listeners that will invoke the implementation's methods
   * when the proxy's corresponding methods are called.
   * @param abstractClass - The abstract class.
   * @param implementationClass - The concrete class constructor.
   */
  registerImplementation<T extends object>(
    abstractClass: AbstractConstructor<T>,
    implementationClass: ClassConstructor<T>,
  ): void {
    // Ensure the abstract class has a proxy registered
    this.registerAbstract(abstractClass);

    const token = this.getToken(abstractClass);
    if (!token) {
      throw new Error(
        `Token not defined for abstract class ${abstractClass.name}`,
      );
    }

    // Register the implementation with the IoC container (may override previous registration)
    this.ioc.register(abstractClass, implementationClass);

    // Remove any previously registered listeners for this abstract class
    this.clearListenersForAbstract(abstractClass);

    const exposeToMethod =
      extractExposeToMethodMap(abstractClass) || new Map<string, string>();
    const eventSet = new Set<string>();

    // For each exposed method, create an event listener that resolves the implementation
    // and calls the actual method.
    exposeToMethod.forEach((methodName, exposeName) => {
      const eventName = `${token}.${exposeName}.__called`;
      eventSet.add(eventName);
      this.on(eventName, (...args: unknown[]) => {
        const instance = this.ioc.resolve(implementationClass);
        const method = Reflect.get(instance, methodName) as unknown;
        if (typeof method !== 'function') {
          throw new Error(
            `Method ${methodName} not found on implementation ${implementationClass.name}`,
          );
        }
        return method.apply(instance, args);
      });
    });

    // Remember which events belong to this abstract class for future cleanup
    this.registeredEvents.set(abstractClass, eventSet);
  }

  /** Retrieves the bootstrap token from an abstract class. */
  private getToken(cls: AbstractConstructor<unknown>): string | undefined {
    return extractBootstrapToken(cls);
  }

  /**
   * Creates a proxy for an abstract class.
   * The proxy overrides exposed methods to emit events instead of performing actual logic.
   * Non-exposed methods are left as-is (will likely fail if called, warning is issued).
   * @param abstractClass - The abstract class to proxy.
   * @param token - The bootstrap token used to construct event names.
   * @returns A proxy object that implements the abstract class.
   */
  private createProxyForAbstract<T extends object>(
    abstractClass: AbstractConstructor<T>,
    token: string,
  ): T {
    const methodToExpose =
      extractMethodToExposeMap(abstractClass) || new Map<string, string>();

    const proto = abstractClass.prototype as Record<string, unknown>;
    // Create an object with the same prototype as the abstract class
    const proxy = Object.create(proto) as T;

    // Define each exposed method to emit an event when called
    methodToExpose.forEach((exposeName, methodName) => {
      Object.defineProperty(proxy, methodName, {
        // Arrow function captures the outer `this` (BootstrapCore instance)
        value: (...args: unknown[]) => {
          const eventName = `${token}.${exposeName}.__called`;
          return this.emit(eventName, ...args);
        },
        enumerable: true,
        configurable: true,
        writable: true,
      });
    });

    // Warn about methods that exist on the prototype but are not exposed
    Object.getOwnPropertyNames(proto).forEach((name) => {
      if (
        name !== 'constructor' &&
        typeof proto[name] === 'function' &&
        !(name in proxy)
      ) {
        console.warn(
          `Method ${name} in abstract class ${abstractClass.name} is not exposed. Calling it will fail.`,
        );
      }
    });

    return proxy;
  }

  /**
   * Removes all event listeners that were registered for a given abstract class.
   * Called before re-registering an implementation to avoid listener duplication.
   * @param abstractClass - The abstract class whose events should be cleared.
   */
  private clearListenersForAbstract(
    abstractClass: AbstractConstructor<unknown>,
  ): void {
    const eventSet = this.registeredEvents.get(abstractClass);
    if (eventSet) {
      eventSet.forEach((eventName) => this.eventListeners.delete(eventName));
      this.registeredEvents.delete(abstractClass);
    }
  }
}

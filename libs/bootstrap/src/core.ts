import 'reflect-metadata';
import { ClassConstructor } from 'class-transformer';
import { IIoCContainer, IEventBus } from './interfaces';
import {
  AbstractConstructor,
  extractBootstrapToken,
  extractExposeToMethodMap,
  extractMethodToExposeMap,
} from '@app/bootstrap/decorators';

export class BootstrapCore implements IEventBus {
  private eventListeners = new Map<string, (...args: unknown[]) => unknown>();
  private abstractProxies = new Map<AbstractConstructor<unknown>, unknown>();
  private registeredEvents = new Map<
    AbstractConstructor<unknown>,
    Set<string>
  >();

  constructor(private ioc: IIoCContainer) {}

  on(eventName: string, listener: (...args: unknown[]) => unknown): void {
    this.eventListeners.set(eventName, listener);
  }

  emit(eventName: string, ...args: unknown[]): unknown {
    const listener = this.eventListeners.get(eventName);
    if (!listener) {
      throw new Error(`No listener for event ${eventName}`);
    }
    return listener(...args);
  }

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
    this.ioc.register(abstractClass, () => proxy);
  }

  registerImplementation<T extends object>(
    abstractClass: AbstractConstructor<T>,
    implementationClass: ClassConstructor<T>,
  ): void {
    this.registerAbstract(abstractClass);

    const token = this.getToken(abstractClass);
    if (!token) {
      throw new Error(
        `Token not defined for abstract class ${abstractClass.name}`,
      );
    }

    this.ioc.register(abstractClass, implementationClass);

    this.clearListenersForAbstract(abstractClass);

    const exposeToMethod =
      extractExposeToMethodMap(abstractClass) || new Map<string, string>();
    const eventSet = new Set<string>();

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

    this.registeredEvents.set(abstractClass, eventSet);
  }

  private getToken(cls: AbstractConstructor<unknown>): string | undefined {
    return extractBootstrapToken(cls);
  }

  private createProxyForAbstract<T extends object>(
    abstractClass: AbstractConstructor<T>,
    token: string,
  ): T {
    const methodToExpose =
      extractMethodToExposeMap(abstractClass) || new Map<string, string>();

    const proto = abstractClass.prototype as Record<string, unknown>;
    const proxy = Object.create(proto) as T;

    methodToExpose.forEach((exposeName, methodName) => {
      Object.defineProperty(proxy, methodName, {
        value: (...args: unknown[]) => {
          const eventName = `${token}.${exposeName}.__called`;
          return this.emit(eventName, ...args);
        },
        enumerable: true,
        configurable: true,
        writable: true,
      });
    });

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

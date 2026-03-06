import 'reflect-metadata';
import { ClassConstructor } from 'class-transformer';
import { IBootstrap, IEventBus } from './interfaces';
import {
  AbstractConstructor,
  extractBootstrapToken,
  extractExposeToMethodMap,
  extractMethodToExposeMap,
} from '@app/bootstrap/decorators';

export class BootstrapCore implements IEventBus {
  private eventListeners = new Map<string, (...args: unknown[]) => unknown>();
  private abstractProxies = new Map<
    AbstractConstructor<IBootstrap>,
    {
      token: string;
      exposeToMethodMap: Map<string, string>;
      instanceCtor: ClassConstructor<IBootstrap>;
      proxy: IBootstrap;
    }
  >();

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

  register<T extends object & IBootstrap>(
    abstractClass: AbstractConstructor<T>,
    implementationClass: ClassConstructor<T>,
  ): void {
    const token = extractBootstrapToken(abstractClass);
    if (!token) {
      throw new Error(
        `Token not defined for abstract class ${abstractClass.name}`,
      );
    }

    if (this.abstractProxies.has(abstractClass)) return;

    const proxy = this.createProxyForAbstract(abstractClass, token);

    const exposeToMethod =
      extractExposeToMethodMap(abstractClass) || new Map<string, string>();

    this.abstractProxies.set(abstractClass, {
      token,
      exposeToMethodMap: exposeToMethod,
      instanceCtor: implementationClass,
      proxy,
    });
  }

  async bootstrap(): Promise<unknown[]> {
    const instances: IBootstrap[] = [];
    for (const {
      token,
      exposeToMethodMap,
      instanceCtor,
    } of this.abstractProxies.values()) {
      const args: IBootstrap[] = [];
      for (const ctorArg of Reflect.getMetadata(
        'design:paramtypes',
        instanceCtor,
      )) {
        const typedArg = ctorArg as AbstractConstructor<IBootstrap>;
        const p = this.abstractProxies.get(typedArg)?.proxy;
        if (p === undefined) {
          throw new Error();
        }
        args.push(p);
      }
      const instance = new instanceCtor(...args);

      for (const [exposeName, methodName] of exposeToMethodMap) {
        const eventName = `${token}.${exposeName}.__called`;
        this.on(eventName, (...args: unknown[]) => {
          const method = Reflect.get(instance, methodName) as unknown;
          if (typeof method !== 'function') {
            throw new Error(
              `Method ${methodName} not found on implementation ${instanceCtor.name}`,
            );
          }
          return method.apply(instance, args);
        });
      }

      instances.push(instance);
    }
    await Promise.all(instances.map((instance) => instance.bootstrap()));
    // Finally returns all runtime providers
    return instances.map((instance) => instance.createRuntime());
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

    return proxy;
  }
}

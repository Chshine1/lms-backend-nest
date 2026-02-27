import { Provider, Type } from '@nestjs/common';

// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class ProxyProviderFactory {
  static create<T extends object>(
    serviceToken: Type<T> | string | symbol,
    bootstrapInstance: T,
    upgradeCallback: (newImpl: T) => void,
  ): Provider {
    let currentImpl: T = bootstrapInstance;

    const proxy = new Proxy({} as T, {
      get(target, prop) {
        if (prop === '__upgrade') {
          return (newImpl: T): void => {
            currentImpl = newImpl;
            upgradeCallback(newImpl);
          };
        }

        if (prop === '__getCurrentImpl') {
          return (): T => currentImpl;
        }

        const value = (currentImpl as any)[prop];

        if (typeof value === 'function') {
          return value.bind(currentImpl);
        }

        return value;
      },

      set(target, prop, value): void {
        (currentImpl as any)[prop] = value;
      },

      has(target, prop): boolean {
        return prop in currentImpl;
      },

      ownKeys(target): (string | symbol)[] {
        return Reflect.ownKeys(currentImpl);
      },

      getOwnPropertyDescriptor(target, prop) {
        return Reflect.getOwnPropertyDescriptor(currentImpl, prop);
      },
    });

    return {
      provide: serviceToken,
      useValue: proxy,
    };
  }

  static createAsync<T extends object>(
    serviceToken: Type<T> | string | symbol,
    bootstrapInstance: T,
    upgradeCallback: (newImpl: T) => Promise<void>,
  ): Provider {
    let currentImpl: T = bootstrapInstance;
    let upgradePromise: Promise<void> | null = null;

    const proxy = new Proxy({} as T, {
      get(target, prop) {
        if (prop === '__upgradeAsync') {
          return async (newImpl: T) => {
            upgradePromise = upgradeCallback(newImpl);
            await upgradePromise;
            currentImpl = newImpl;
            upgradePromise = null;
          };
        }

        if (prop === '__getCurrentImpl') {
          return () => currentImpl;
        }

        if (upgradePromise) {
          if (typeof (currentImpl as any)[prop] === 'function') {
            return async (...args: any[]) => {
              if (upgradePromise) {
                await upgradePromise;
              }
              return (currentImpl as any)[prop](...args);
            };
          } else {
            return (currentImpl as any)[prop];
          }
        }

        const value = (currentImpl as any)[prop];

        if (typeof value === 'function') {
          return value.bind(currentImpl);
        }

        return value;
      },
    });

    return {
      provide: serviceToken,
      useValue: proxy,
    };
  }
}

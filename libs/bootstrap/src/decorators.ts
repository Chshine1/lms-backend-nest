import 'reflect-metadata';

// Symbol keys for storing metadata on constructors
const bootstrapTokenSymbol = Symbol.for('bootstrap:token');
const exposeToMethodMapSymbol = Symbol.for('bootstrap:exposeToMethodMap');
const methodToExposeMapSymbol = Symbol.for('bootstrap:methodToExposeMap');

export type AbstractConstructor<T> = abstract new (...args: unknown[]) => T;

/**
 * Extracts the bootstrap token stored on an abstract class constructor.
 * @param target - The abstract class constructor.
 * @returns The token string if defined, otherwise undefined.
 */
export const extractBootstrapToken = (
  target: AbstractConstructor<unknown>,
): string | undefined => {
  return Reflect.getMetadata(bootstrapTokenSymbol, target) as
    | string
    | undefined;
};

/**
 * Extracts the map from exposed name to method name for an abstract class.
 * @param target - The abstract class constructor.
 * @returns A Map where keys are exposed names and values are method names.
 */
export const extractExposeToMethodMap = (
  target: AbstractConstructor<unknown>,
): Map<string, string> | undefined => {
  return Reflect.getMetadata(exposeToMethodMapSymbol, target) as
    | Map<string, string>
    | undefined;
};

/**
 * Extracts the map from method name to exposed name for an abstract class.
 * @param target - The abstract class constructor.
 * @returns A Map where keys are method names and values are exposed names.
 */
export const extractMethodToExposeMap = (
  target: AbstractConstructor<unknown>,
): Map<string, string> | undefined => {
  return Reflect.getMetadata(methodToExposeMapSymbol, target) as
    | Map<string, string>
    | undefined;
};

/**
 * Class decorator that associates a bootstrap token with an abstract class.
 * The token is used to generate event names and identify the abstraction in the container.
 * @param token - Unique token string for the abstraction.
 */
export const BootstrapToken = (token: string) => {
  return (target: AbstractConstructor<unknown>): void => {
    Reflect.defineMetadata(bootstrapTokenSymbol, token, target);
  };
};

/**
 * Method decorator that marks a method as an exposed dependency.
 * This creates a bidirectional mapping between the exposed name and the method name.
 * When the abstract class is proxied, calls to this method will trigger an event,
 * and when an implementation is registered, the event will invoke the corresponding method.
 * @param name - The exposed name used in event naming.
 */
export const ExposeDependency = (name: string) => {
  return (target: object, propertyKey: string): void => {
    const ctor = target.constructor as AbstractConstructor<unknown>;

    // Build or update exposeToMethod map (exposed name -> method name)
    let exposeToMethod = extractExposeToMethodMap(ctor);
    if (!exposeToMethod) {
      exposeToMethod = new Map();
      Reflect.defineMetadata(exposeToMethodMapSymbol, exposeToMethod, ctor);
    }
    exposeToMethod.set(name, propertyKey);

    // Build or update methodToExpose map (method name -> exposed name)
    let methodToExpose = extractMethodToExposeMap(ctor);
    if (!methodToExpose) {
      methodToExpose = new Map();
      Reflect.defineMetadata(methodToExposeMapSymbol, methodToExpose, ctor);
    }
    methodToExpose.set(propertyKey, name);
  };
};

import 'reflect-metadata';
import { ClassConstructor } from 'class-transformer';

const bootstrapTokenSymbol = Symbol.for('bootstrap:token');
const exposeToMethodMapSymbol = Symbol.for('bootstrap:exposeToMethodMap');
const methodToExposeMapSymbol = Symbol.for('bootstrap:methodToExposeMap');

export const extractBootstrapToken = (
  target: ClassConstructor<unknown>,
): string | undefined => {
  return Reflect.getMetadata(bootstrapTokenSymbol, target) as
    | string
    | undefined;
};

export const extractExposeToMethodMap = (
  target: ClassConstructor<unknown>,
): Map<string, string> | undefined => {
  return Reflect.getMetadata(exposeToMethodMapSymbol, target) as
    | Map<string, string>
    | undefined;
};

export const extractMethodToExposeMap = (
  target: ClassConstructor<unknown>,
): Map<string, string> | undefined => {
  return Reflect.getMetadata(methodToExposeMapSymbol, target) as
    | Map<string, string>
    | undefined;
};

export const BootstrapToken = (token: string) => {
  return (target: ClassConstructor<unknown>): void => {
    Reflect.defineMetadata(bootstrapTokenSymbol, token, target);
  };
};

export const ExposeDependency = (name: string) => {
  return (target: object, propertyKey: string): void => {
    const ctor = target.constructor as ClassConstructor<unknown>;

    let exposeToMethod = extractExposeToMethodMap(ctor);
    if (!exposeToMethod) {
      exposeToMethod = new Map();
      Reflect.defineMetadata(exposeToMethodMapSymbol, exposeToMethod, ctor);
    }
    exposeToMethod.set(name, propertyKey);

    let methodToExpose = extractMethodToExposeMap(ctor);
    if (!methodToExpose) {
      methodToExpose = new Map();
      Reflect.defineMetadata(methodToExposeMapSymbol, methodToExpose, ctor);
    }
    methodToExpose.set(propertyKey, name);
  };
};

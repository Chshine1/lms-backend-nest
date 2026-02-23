import { ConfigArray, ConfigObject } from '../interfaces/raw-config.interface';
import { ConfigError, ConfigErrorCode } from './errors';

export function getString(raw: ConfigObject, key: string): string | undefined {
  const value = raw[key];
  if (value === undefined) return undefined;
  if (typeof value !== 'string') {
    throw new ConfigError(
      `Expected string for key "${key}", got ${typeof value}`,
      ConfigErrorCode.TYPE_MISMATCH,
      key,
    );
  }
  return value;
}

export function getRequiredString(raw: ConfigObject, key: string): string {
  const value = raw[key];
  if (value === undefined)
    throw new ConfigError(
      `Required key "${key}" not found`,
      ConfigErrorCode.MISSING_REQUIRED_KEY,
      key,
    );
  if (typeof value !== 'string') {
    throw new ConfigError(
      `Expected string for key "${key}", got ${typeof value}`,
      ConfigErrorCode.TYPE_MISMATCH,
      key,
    );
  }
  return value;
}

export function getNumber(raw: ConfigObject, key: string): number | undefined {
  const value = raw[key];
  if (value === undefined) return undefined;
  if (typeof value !== 'number') {
    throw new ConfigError(
      `Expected number for key "${key}", got ${typeof value}`,
      ConfigErrorCode.TYPE_MISMATCH,
      key,
    );
  }
  return value;
}

export function getBoolean(
  raw: ConfigObject,
  key: string,
): boolean | undefined {
  const value = raw[key];
  if (value === undefined) return undefined;
  if (typeof value !== 'boolean') {
    throw new ConfigError(
      `Expected boolean for key "${key}", got ${typeof value}`,
      ConfigErrorCode.TYPE_MISMATCH,
      key,
    );
  }
  return value;
}

export function getArray(
  raw: ConfigObject,
  key: string,
): ConfigArray | undefined {
  const value = raw[key];
  if (value === undefined) return undefined;
  if (!Array.isArray(value)) {
    throw new ConfigError(
      `Expected array for key "${key}", got ${typeof value}`,
      ConfigErrorCode.TYPE_MISMATCH,
      key,
    );
  }
  return value;
}

export function getObject(
  raw: ConfigObject,
  key: string,
): ConfigObject | undefined {
  const value = raw[key];
  if (value === undefined) return undefined;
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    throw new ConfigError(
      `Expected object for key "${key}", got ${value === null ? 'null' : Array.isArray(value) ? 'array' : typeof value}`,
      ConfigErrorCode.TYPE_MISMATCH,
      key,
    );
  }
  return value;
}

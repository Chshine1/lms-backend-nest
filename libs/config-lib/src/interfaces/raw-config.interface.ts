export type ConfigPrimitive = string | number | boolean | null;

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface ConfigArray extends Array<ConfigValue> {}

export interface ConfigObject {
  [key: string]: ConfigValue;
}

export type ConfigValue = ConfigPrimitive | ConfigArray | ConfigObject;

export interface Config extends ConfigObject {
  environment: string;
  serviceName: string;
}

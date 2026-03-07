import { ClassConstructor } from 'class-transformer';
import { ConfigurationLoader } from './loader.interface';

export interface LoaderDefinition {
  loader: ClassConstructor<ConfigurationLoader>;
  deps: ClassConstructor<object>[];
  schema: ClassConstructor<object>;
}

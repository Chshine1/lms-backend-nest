import { ConfigObject } from '@app/config-lib/interfaces/raw-config.interface';

export interface ConfigLoader<TOptions> {
  load(options: TOptions): Promise<ConfigObject>;
}

export interface ModuleLoader {
  load(): Promise<void>;
  service: object;
  isReady: boolean;
}

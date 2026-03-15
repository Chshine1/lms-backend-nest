export interface ModuleLoader {
  load(): Promise<void>;
  isReady: boolean;
}

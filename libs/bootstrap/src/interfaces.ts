export interface IEventBus {
  on(eventName: string, listener: (...args: unknown[]) => unknown): void;
  emit(eventName: string, ...args: unknown[]): unknown;
}

export interface IBootstrap {
  bootstrap(): Promise<void>;
  createRuntime(): unknown;
}

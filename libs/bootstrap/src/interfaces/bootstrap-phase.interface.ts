export type BootstrapPhase = 'pre-bootstrap' | 'bootstrap' | 'post-bootstrap';

export interface BootstrapPhaseChangeEvent {
  from: BootstrapPhase;
  to: BootstrapPhase;
  timestamp: Date;
}

export interface BootstrapPhaseListener {
  onBootstrapPhaseChange(
    event: BootstrapPhaseChangeEvent,
  ): Promise<void> | void;
}

export interface BootstrapLifecycle {
  preBootstrap: (() => Promise<void> | void) | undefined;
  bootstrap: (() => Promise<void> | void) | undefined;
  postBootstrap: (() => Promise<void> | void) | undefined;
}

export interface BootstrapOptions {
  timeout?: number;
  enableLogging?: boolean;
  retryAttempts?: number;
}

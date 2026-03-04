export type BootstrapPhase = 'pre-bootstrap' | 'bootstrap' | 'post-bootstrap';

export enum BootstrapErrorCode {
  PHASE_TRANSITION_FAILED = 'PHASE_TRANSITION_FAILED',
  LIFECYCLE_EXECUTION_FAILED = 'LIFECYCLE_EXECUTION_FAILED',
  TIMEOUT = 'TIMEOUT',
  MANAGER_DESTROYED = 'MANAGER_DESTROYED',
  INVALID_PHASE = 'INVALID_PHASE',
}

export class BootstrapError extends Error {
  constructor(
    message: string,
    public readonly code: BootstrapErrorCode,
    public readonly phase: BootstrapPhase,
    public override readonly cause?: Error,
  ) {
    super(message);
    this.name = 'BootstrapError';
  }
}

export interface BootstrapPhaseChangeEvent {
  from: BootstrapPhase;
  to: BootstrapPhase;
  timestamp: Date;
}

export interface BootstrapPhaseListener {
  onBootstrapPhaseChange(event: BootstrapPhaseChangeEvent): Promise<void>;
}

export interface BootstrapLifecycle {
  preBootstrap?(): Promise<void>;
  bootstrap?(): Promise<void>;
  postBootstrap?(): Promise<void>;
}

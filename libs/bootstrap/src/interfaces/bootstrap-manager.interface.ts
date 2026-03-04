import { Observable } from 'rxjs';
import {
  BootstrapPhase,
  BootstrapPhaseChangeEvent,
  BootstrapLifecycle,
  BootstrapError,
} from './bootstrap-phase.interface';
import {
  BootstrapConfig,
  BootstrapOptions,
} from './bootstrap-config.interface';

export interface BootstrapHealthCheck {
  name: string;
  check(): Promise<boolean>;
  timeout?: number;
}

export interface BootstrapManager {
  readonly currentPhase: BootstrapPhase;
  readonly phaseChanges: Observable<BootstrapPhaseChangeEvent>;
  readonly config: Readonly<BootstrapConfig>;

  registerLifecycle(lifecycle: BootstrapLifecycle): void;
  unregisterLifecycle(lifecycle: BootstrapLifecycle): void;

  addPhaseListener(
    listener: (event: BootstrapPhaseChangeEvent) => void,
  ): () => void;

  startBootstrap(options?: BootstrapOptions): Promise<void>;
  completeBootstrap(): Promise<void>;

  isBootstrapPhase(): boolean;
  isPreBootstrapPhase(): boolean;
  isPostBootstrapPhase(): boolean;

  waitForPhase(phase: BootstrapPhase, timeout?: number): Promise<void>;

  addHealthCheck(check: BootstrapHealthCheck): void;
  runHealthChecks(): Promise<Map<string, boolean>>;

  validateConfig(): Promise<BootstrapError[]>;
}

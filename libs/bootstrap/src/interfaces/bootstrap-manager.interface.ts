import { Observable } from 'rxjs';
import {
  BootstrapPhase,
  BootstrapPhaseChangeEvent,
  BootstrapLifecycle,
  BootstrapOptions,
} from './bootstrap-phase.interface';

export interface BootstrapManager {
  readonly currentPhase: BootstrapPhase;
  readonly phaseChanges: Observable<BootstrapPhaseChangeEvent>;

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
}

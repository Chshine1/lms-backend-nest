import { Injectable, OnModuleDestroy } from '@nestjs/common';
import {
  BehaviorSubject,
  Observable,
  Subject,
  timeout,
  firstValueFrom,
} from 'rxjs';
import {
  BootstrapPhase,
  BootstrapPhaseChangeEvent,
  BootstrapLifecycle,
  BootstrapOptions,
} from '../interfaces/bootstrap-phase.interface';
import { BootstrapManager } from '../interfaces/bootstrap-manager.interface';

export class BootstrapError extends Error {
  constructor(
    message: string,
    public readonly phase: BootstrapPhase,
    public override readonly cause?: Error,
  ) {
    super(message);
    this.name = 'BootstrapError';
  }
}

@Injectable()
export class BootstrapManagerService
  implements BootstrapManager, OnModuleDestroy
{
  private readonly phaseSubject = new BehaviorSubject<BootstrapPhase>(
    'pre-bootstrap',
  );
  private readonly phaseChangeSubject =
    new Subject<BootstrapPhaseChangeEvent>();
  private readonly lifecycles = new Set<BootstrapLifecycle>();
  private readonly listeners = new Set<
    (event: BootstrapPhaseChangeEvent) => void
  >();
  private isDestroyed = false;

  readonly currentPhase: BootstrapPhase = this.phaseSubject.value;
  readonly phaseChanges: Observable<BootstrapPhaseChangeEvent> =
    this.phaseChangeSubject.asObservable();

  async startBootstrap(options: BootstrapOptions = {}): Promise<void> {
    if (this.isDestroyed) {
      throw new BootstrapError(
        'BootstrapManager has been destroyed',
        this.currentPhase,
      );
    }

    if (this.currentPhase !== 'pre-bootstrap') {
      throw new BootstrapError(
        `Cannot start bootstrap from phase: ${this.currentPhase}`,
        this.currentPhase,
      );
    }

    const { enableLogging = true, retryAttempts = 3 } = options;

    try {
      await this.transitionPhase('pre-bootstrap', 'bootstrap', enableLogging);

      for (const lifecycle of this.lifecycles) {
        const bootstrapFn = lifecycle.bootstrap;
        if (bootstrapFn !== undefined) {
          await this.executeWithRetry(bootstrapFn, retryAttempts, 'bootstrap');
        }
      }
    } catch (error) {
      if (enableLogging) {
        console.error('Bootstrap failed:', error);
      }
      throw error;
    }
  }

  async completeBootstrap(): Promise<void> {
    if (this.isDestroyed) {
      throw new BootstrapError(
        'BootstrapManager has been destroyed',
        this.currentPhase,
      );
    }

    if (this.currentPhase !== 'bootstrap') {
      throw new BootstrapError(
        `Cannot complete bootstrap from phase: ${this.currentPhase}`,
        this.currentPhase,
      );
    }

    try {
      await this.transitionPhase('bootstrap', 'post-bootstrap', true);

      for (const lifecycle of this.lifecycles) {
        if (lifecycle.postBootstrap) {
          await lifecycle.postBootstrap();
        }
      }
    } catch (error) {
      console.error('Bootstrap completion failed:', error);
      throw error;
    }
  }

  registerLifecycle(lifecycle: BootstrapLifecycle): void {
    if (this.isDestroyed) return;
    this.lifecycles.add(lifecycle);
  }

  unregisterLifecycle(lifecycle: BootstrapLifecycle): void {
    this.lifecycles.delete(lifecycle);
  }

  addPhaseListener(
    listener: (event: BootstrapPhaseChangeEvent) => void,
  ): () => void {
    if (this.isDestroyed) {
      return () => {};
    }

    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  isBootstrapPhase(): boolean {
    return this.currentPhase === 'bootstrap';
  }

  isPreBootstrapPhase(): boolean {
    return this.currentPhase === 'pre-bootstrap';
  }

  isPostBootstrapPhase(): boolean {
    return this.currentPhase === 'post-bootstrap';
  }

  async waitForPhase(
    phase: BootstrapPhase,
    timeoutMs: number = 30000,
  ): Promise<void> {
    if (this.currentPhase === phase) {
      return;
    }

    try {
      await firstValueFrom(
        this.phaseChanges.pipe(
          timeout({
            each: timeoutMs,
            with: () => {
              throw new BootstrapError(
                `Timeout waiting for phase: ${phase}`,
                this.currentPhase,
              );
            },
          }),
        ),
      );
    } catch (error) {
      if (error instanceof BootstrapError) {
        throw error;
      }
      throw new BootstrapError(
        `Failed to wait for phase: ${phase}`,
        this.currentPhase,
        error as Error,
      );
    }
  }

  onModuleDestroy(): Promise<void> {
    this.isDestroyed = true;
    this.phaseSubject.complete();
    this.phaseChangeSubject.complete();
    this.listeners.clear();
    this.lifecycles.clear();
    return Promise.resolve();
  }

  private async transitionPhase(
    from: BootstrapPhase,
    to: BootstrapPhase,
    enableLogging: boolean,
  ): Promise<void> {
    if (this.phaseSubject.value !== from) {
      throw new BootstrapError(
        `Expected phase ${from}, but current phase is ${this.currentPhase}`,
        this.currentPhase,
      );
    }

    const event: BootstrapPhaseChangeEvent = {
      from,
      to,
      timestamp: new Date(),
    };

    if (enableLogging) {
      console.log(`Bootstrap phase transition: ${from} -> ${to}`);
    }

    this.phaseSubject.next(to);
    this.phaseChangeSubject.next(event);

    for (const listener of this.listeners) {
      try {
        listener(event);
      } catch (error) {
        console.warn('Phase listener error:', error);
      }
    }

    await new Promise((resolve) => setTimeout(resolve, 0));
  }

  private async executeWithRetry<T>(
    operation: () => Promise<T>,
    maxAttempts: number,
    phase: BootstrapPhase,
  ): Promise<T> {
    let lastError: Error | undefined = undefined;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;
        if (attempt < maxAttempts) {
          console.warn(
            `Bootstrap operation failed (attempt ${attempt.toString()}/${maxAttempts.toString()}), retrying...`,
            error,
          );
          await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
        }
      }
    }

    throw new BootstrapError(
      `Bootstrap operation failed after ${maxAttempts.toString()} attempts`,
      phase,
      lastError,
    );
  }
}

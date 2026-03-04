import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { validate } from 'class-validator';
import {
  BehaviorSubject,
  Observable,
  Subject,
  firstValueFrom,
  timeout,
  filter,
} from 'rxjs';
import {
  BootstrapPhase,
  BootstrapPhaseChangeEvent,
  BootstrapLifecycle,
  BootstrapError,
  BootstrapErrorCode,
} from '../interfaces/bootstrap-phase.interface';
import {
  BootstrapManager,
  BootstrapHealthCheck,
} from '../interfaces/bootstrap-manager.interface';
import {
  BootstrapConfig,
  BootstrapOptions,
} from '../interfaces/bootstrap-config.interface';

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
  private readonly healthChecks = new Map<string, BootstrapHealthCheck>();
  private isDestroyed = false;
  private readonly _config: BootstrapConfig;

  readonly currentPhase: BootstrapPhase = this.phaseSubject.value;
  readonly phaseChanges: Observable<BootstrapPhaseChangeEvent> =
    this.phaseChangeSubject.asObservable();

  constructor(config?: Partial<BootstrapConfig>) {
    this._config = {
      bootstrap: {
        timeout: 30000,
        enableLogging: true,
        retryAttempts: 3,
      },
      eventBus: {
        enabled: true,
        bufferSize: 100,
      },
      ...config,
    };
  }

  get config(): Readonly<BootstrapConfig> {
    return this._config;
  }

  async startBootstrap(options: BootstrapOptions = {}): Promise<void> {
    if (this.isDestroyed) {
      throw new BootstrapError(
        'BootstrapManager has been destroyed',
        BootstrapErrorCode.MANAGER_DESTROYED,
        this.currentPhase,
      );
    }

    if (this.currentPhase !== 'pre-bootstrap') {
      throw new BootstrapError(
        `Cannot start bootstrap from phase: ${this.currentPhase}`,
        BootstrapErrorCode.INVALID_PHASE,
        this.currentPhase,
      );
    }

    const phaseConfig = this.config.bootstrap;
    const {
      enableLogging = phaseConfig.enableLogging ?? true,
      retryAttempts = phaseConfig.retryAttempts ?? 3,
    } = options;

    try {
      await this.transitionPhase('pre-bootstrap', 'bootstrap', enableLogging);

      const bootstrapPromises = Array.from(this.lifecycles)
        .map((lifecycle) => lifecycle.bootstrap?.bind(lifecycle))
        .filter((fn): fn is () => Promise<void> => fn !== undefined)
        .map((fn) => this.executeWithRetry(fn, retryAttempts, 'bootstrap'));

      await Promise.allSettled(bootstrapPromises);

      const errors = await this.runHealthChecks();
      const failedChecks = Array.from(errors.entries())
        .filter(([, success]) => !success)
        .map(([name]) => name);

      if (failedChecks.length > 0) {
        throw new BootstrapError(
          `Health checks failed: ${failedChecks.join(', ')}`,
          BootstrapErrorCode.LIFECYCLE_EXECUTION_FAILED,
          'bootstrap',
        );
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
        BootstrapErrorCode.MANAGER_DESTROYED,
        this.currentPhase,
      );
    }

    if (this.currentPhase !== 'bootstrap') {
      throw new BootstrapError(
        `Cannot complete bootstrap from phase: ${this.currentPhase}`,
        BootstrapErrorCode.INVALID_PHASE,
        this.currentPhase,
      );
    }

    try {
      await this.transitionPhase('bootstrap', 'post-bootstrap', true);

      const postBootstrapPromises = Array.from(this.lifecycles)
        .map((lifecycle) => lifecycle.postBootstrap?.bind(lifecycle))
        .filter((fn): fn is () => Promise<void> => fn !== undefined)
        .map((fn) => fn());

      await Promise.allSettled(postBootstrapPromises);
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

  addHealthCheck(check: BootstrapHealthCheck): void {
    if (this.isDestroyed) return;
    this.healthChecks.set(check.name, check);
  }

  async runHealthChecks(): Promise<Map<string, boolean>> {
    const results = new Map<string, boolean>();

    for (const [name, check] of this.healthChecks) {
      try {
        const timeoutMs = check.timeout || 5000;
        const result = await Promise.race([
          check.check(),
          new Promise<boolean>((_, reject) =>
            setTimeout(() => {
              reject(new Error('Timeout'));
            }, timeoutMs),
          ),
        ]);
        results.set(name, result);
      } catch {
        results.set(name, false);
      }
    }

    return results;
  }

  async validateConfig(): Promise<BootstrapError[]> {
    const errors: BootstrapError[] = [];

    try {
      const validationErrors = await validate(this.config);
      if (validationErrors.length > 0) {
        errors.push(
          new BootstrapError(
            'Configuration validation failed',
            BootstrapErrorCode.INVALID_PHASE,
            this.currentPhase,
            new Error(validationErrors.map((e) => e.toString()).join(', ')),
          ),
        );
      }
    } catch (error) {
      errors.push(
        new BootstrapError(
          'Configuration validation error',
          BootstrapErrorCode.INVALID_PHASE,
          this.currentPhase,
          error as Error,
        ),
      );
    }

    return errors;
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
          filter((event) => event.to === phase),
          timeout(timeoutMs),
        ),
      );
    } catch (error) {
      throw new BootstrapError(
        `Timeout waiting for phase: ${phase}`,
        BootstrapErrorCode.TIMEOUT,
        this.currentPhase,
        error as Error,
      );
    }
  }

  onModuleDestroy(): Promise<void> {
    this.isDestroyed = true;
    this.phaseChangeSubject.complete();
    this.lifecycles.clear();
    this.listeners.clear();
    this.healthChecks.clear();
    return Promise.resolve();
  }

  private transitionPhase(
    from: BootstrapPhase,
    to: BootstrapPhase,
    enableLogging: boolean,
  ): Promise<void> {
    if (enableLogging) {
      console.log(`Transitioning from ${from} to ${to}`);
    }

    const event: BootstrapPhaseChangeEvent = {
      from,
      to,
      timestamp: new Date(),
    };

    this.phaseSubject.next(to);
    this.phaseChangeSubject.next(event);

    for (const listener of this.listeners) {
      try {
        listener(event);
      } catch (error) {
        if (enableLogging) {
          console.error('Phase listener error:', error);
        }
      }
    }

    return Promise.resolve();
  }

  private async executeWithRetry(
    fn: () => Promise<void>,
    maxAttempts: number,
    phase: BootstrapPhase,
    timeoutMs: number = 30000,
  ): Promise<void> {
    let lastError: Error = new Error('No attempts made');

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        await Promise.race([
          fn(),
          new Promise<void>((_, reject) =>
            setTimeout(() => {
              reject(new Error('Timeout'));
            }, timeoutMs),
          ),
        ]);
        return;
      } catch (error) {
        lastError = error as Error;
        if (attempt < maxAttempts) {
          const delay = Math.min(1000 * Math.pow(2, attempt - 1), 30000);
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      }
    }

    throw new BootstrapError(
      `Failed after ${maxAttempts.toString()} attempts`,
      BootstrapErrorCode.LIFECYCLE_EXECUTION_FAILED,
      phase,
      lastError,
    );
  }
}

import { Injectable, OnModuleInit } from '@nestjs/common';
import {
  BootstrapLifecycleAware,
  BootstrapLifecycleHandler,
  InjectBootstrapManager,
} from '../decorators/bootstrap-lifecycle.decorator';
import type { BootstrapManager } from '../interfaces/bootstrap-manager.interface';
import { BootstrapEventBusService } from '../services/bootstrap-event-bus.service';

@Injectable()
@BootstrapLifecycleHandler()
export class ConfigIntegrationExample
  implements OnModuleInit, BootstrapLifecycleAware
{
  private config: object = {};

  constructor(
    @InjectBootstrapManager()
    public readonly bootstrapManager: BootstrapManager,
    private readonly eventBus: BootstrapEventBusService,
  ) {}

  onModuleInit(): Promise<void> {
    this.setupEventHandlers();
    return Promise.resolve();
  }

  preBootstrap(): Promise<void> {
    console.log('Config: Pre-bootstrap phase - loading basic configuration');

    this.config = {
      bootstrap: true,
      logger: { level: 'info' },
    };

    this.eventBus.publish({
      type: 'basic-config-loaded',
      phase: 'pre-bootstrap',
      payload: this.config,
    });

    return Promise.resolve();
  }

  async bootstrap(): Promise<void> {
    console.log('Config: Bootstrap phase - loading full configuration');

    await new Promise((resolve) => setTimeout(resolve, 1500));

    this.config = {
      ...this.config,
      bootstrap: false,
      database: { url: 'localhost:5432' },
      redis: { host: 'localhost', port: 6379 },
      logger: { level: 'debug', format: 'json' },
    };

    this.eventBus.publish({
      type: 'full-config-loaded',
      phase: 'bootstrap',
      payload: this.config,
    });
  }

  postBootstrap(): Promise<void> {
    console.log('Config: Post-bootstrap phase - configuration ready');

    this.eventBus.publish({
      type: 'config-ready',
      phase: 'post-bootstrap',
      payload: this.config,
    });

    return Promise.resolve();
  }

  private setupEventHandlers(): void {
    this.eventBus.subscribe('logger-ready').subscribe(() => {
      console.log('Config: Logger ready event received');
    });

    this.bootstrapManager.addPhaseListener((event) => {
      if (event.to === 'post-bootstrap') {
        console.log('Config: Bootstrap completed, switching to runtime config');
      }
    });
  }

  updateConfig(newConfig: Partial<unknown>): void {
    this.config = { ...this.config, ...newConfig };

    this.eventBus.publish({
      type: 'config-updated',
      phase: this.bootstrapManager.isPostBootstrapPhase()
        ? 'post-bootstrap'
        : 'bootstrap',
      payload: newConfig,
    });
  }
}

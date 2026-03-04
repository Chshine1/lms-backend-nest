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
export class LoggerIntegrationExample
  implements OnModuleInit, BootstrapLifecycleAware
{
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
    console.log('Logger: Pre-bootstrap phase - setting up basic logging');
    this.eventBus.publish({
      type: 'logger-ready',
      phase: 'pre-bootstrap',
      payload: { level: 'info', bootstrap: true },
    });
    return Promise.resolve();
  }

  async bootstrap(): Promise<void> {
    console.log(
      'Logger: Bootstrap phase - loading configuration and initializing',
    );

    await new Promise((resolve) => setTimeout(resolve, 1000));

    this.eventBus.publish({
      type: 'logger-configured',
      phase: 'bootstrap',
      payload: { level: 'debug', format: 'json' },
    });
  }

  postBootstrap(): Promise<void> {
    console.log('Logger: Post-bootstrap phase - switching to runtime mode');

    this.eventBus.publish({
      type: 'logger-ready',
      phase: 'post-bootstrap',
      payload: { level: 'info', bootstrap: false },
    });

    return Promise.resolve();
  }

  private setupEventHandlers(): void {
    this.eventBus.subscribe('config-loaded').subscribe(() => {
      console.log('Logger: Configuration loaded, updating logger config');
    });

    this.bootstrapManager.phaseChanges.subscribe((event) => {
      console.log(`Logger: Phase changed from ${event.from} to ${event.to}`);
    });
  }

  log(message: string, level: string = 'info'): void {
    if (this.bootstrapManager.isBootstrapPhase()) {
      console.log(`[BOOTSTRAP] ${level.toUpperCase()}: ${message}`);
    } else {
      console.log(`[RUNTIME] ${level.toUpperCase()}: ${message}`);
    }
  }
}

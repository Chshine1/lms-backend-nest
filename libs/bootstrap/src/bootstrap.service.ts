import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { BootstrapManagerService } from './services/bootstrap-manager.service';
import { BootstrapEventBusService } from './services/bootstrap-event-bus.service';
import { BootstrapManager } from './interfaces/bootstrap-manager.interface';
import { BootstrapOptions } from './interfaces/bootstrap-phase.interface';

@Injectable()
export class BootstrapService implements OnModuleInit, OnModuleDestroy {
  constructor(
    private readonly bootstrapManager: BootstrapManagerService,
    private readonly eventBus: BootstrapEventBusService,
  ) {}

  onModuleInit(): Promise<void> {
    this.setupEventHandlers();
    return Promise.resolve();
  }

  async onModuleDestroy(): Promise<void> {
    await this.bootstrapManager.onModuleDestroy();
    await this.eventBus.onModuleDestroy();
  }

  getManager(): BootstrapManager {
    return this.bootstrapManager;
  }

  async startBootstrap(options?: BootstrapOptions): Promise<void> {
    await this.bootstrapManager.startBootstrap(options);
  }

  async completeBootstrap(): Promise<void> {
    await this.bootstrapManager.completeBootstrap();
  }

  isBootstrapPhase(): boolean {
    return this.bootstrapManager.isBootstrapPhase();
  }

  isPreBootstrapPhase(): boolean {
    return this.bootstrapManager.isPreBootstrapPhase();
  }

  isPostBootstrapPhase(): boolean {
    return this.bootstrapManager.isPostBootstrapPhase();
  }

  async waitForBootstrapComplete(): Promise<void> {
    await this.bootstrapManager.waitForPhase('post-bootstrap');
  }

  private setupEventHandlers(): void {
    this.bootstrapManager.phaseChanges.subscribe((event) => {
      this.eventBus.publish({
        type: 'phase-change',
        payload: event,
        phase: event.to,
      });
    });

    this.eventBus.subscribe('infrastructure-ready').subscribe((event) => {
      console.log('Infrastructure ready event received:', event);
    });

    this.eventBus.subscribe('config-loaded').subscribe((event) => {
      console.log('Configuration loaded event received:', event);
    });
  }
}

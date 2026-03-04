import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { Subject, Observable, filter } from 'rxjs';

export interface BootstrapEvent {
  type: string;
  payload?: unknown;
  timestamp: Date;
  phase: 'pre-bootstrap' | 'bootstrap' | 'post-bootstrap';
}

@Injectable()
export class BootstrapEventBusService implements OnModuleDestroy {
  private readonly eventSubject = new Subject<BootstrapEvent>();
  private isDestroyed = false;

  readonly events: Observable<BootstrapEvent> =
    this.eventSubject.asObservable();

  publish(event: Omit<BootstrapEvent, 'timestamp'>): void {
    if (this.isDestroyed) return;

    const fullEvent: BootstrapEvent = {
      ...event,
      timestamp: new Date(),
    };

    this.eventSubject.next(fullEvent);
  }

  subscribe(
    eventType: string,
  ): Observable<BootstrapEvent & { payload?: unknown }> {
    return this.events.pipe(
      filter((event) => event.type === eventType),
    ) as Observable<BootstrapEvent & { payload?: unknown }>;
  }

  subscribeToPhase(
    phase: 'pre-bootstrap' | 'bootstrap' | 'post-bootstrap',
  ): Observable<BootstrapEvent> {
    return this.events.pipe(filter((event) => event.phase === phase));
  }

  onModuleDestroy(): Promise<void> {
    this.isDestroyed = true;
    this.eventSubject.complete();
    return Promise.resolve();
  }
}

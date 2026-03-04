import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { Subject, Observable, filter } from 'rxjs';
import { BootstrapPhase } from '../interfaces/bootstrap-phase.interface';

export interface TypedBootstrapEvent<T = unknown> {
  type: string;
  payload?: T;
  timestamp: Date;
  phase: BootstrapPhase;
}

@Injectable()
export class BootstrapEventBusService implements OnModuleDestroy {
  private readonly eventSubject = new Subject<TypedBootstrapEvent>();
  private isDestroyed = false;

  readonly events: Observable<TypedBootstrapEvent> =
    this.eventSubject.asObservable();

  publish<T = unknown>(event: Omit<TypedBootstrapEvent<T>, 'timestamp'>): void {
    if (this.isDestroyed) return;

    const fullEvent: TypedBootstrapEvent<T> = {
      ...event,
      timestamp: new Date(),
    };

    this.eventSubject.next(fullEvent);
  }

  subscribe<T = unknown>(
    eventType: string,
  ): Observable<TypedBootstrapEvent<T>> {
    return this.events.pipe(
      filter((event) => event.type === eventType),
    ) as Observable<TypedBootstrapEvent<T>>;
  }

  subscribeToPhase(phase: BootstrapPhase): Observable<TypedBootstrapEvent> {
    return this.events.pipe(filter((event) => event.phase === phase));
  }

  onModuleDestroy(): Promise<void> {
    this.isDestroyed = true;
    this.eventSubject.complete();
    return Promise.resolve();
  }
}

import { Injectable } from '@nestjs/common';
import type { RabbitMQOutboxMessage } from '../contracts/rabbitmq-options.interface';
import type { OutboxRepository } from './rabbitmq-outbox.service';

@Injectable()
export class InMemoryOutboxRepository implements OutboxRepository {
  private messages: Map<string, RabbitMQOutboxMessage> = new Map();
  private processedIds: Set<string> = new Set();

  findPending(limit: number): Promise<RabbitMQOutboxMessage[]> {
    const pending: RabbitMQOutboxMessage[] = [];
    for (const msg of this.messages.values()) {
      if (!this.processedIds.has(msg.id) && pending.length < limit) {
        pending.push(msg);
      }
    }
    return Promise.resolve(pending);
  }

  markProcessed(id: string): Promise<void> {
    this.processedIds.add(id);
    return Promise.resolve();
  }

  incrementRetry(id: string): Promise<void> {
    const msg = this.messages.get(id);
    if (msg) {
      msg.retryCount++;
    }
    return Promise.resolve();
  }

  save(message: RabbitMQOutboxMessage): Promise<void> {
    this.messages.set(message.id, message);
    return Promise.resolve();
  }

  clear(): void {
    this.messages.clear();
    this.processedIds.clear();
  }
}

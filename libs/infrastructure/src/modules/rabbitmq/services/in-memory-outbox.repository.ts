import { Injectable } from '@nestjs/common';
import type { RabbitMQOutboxMessage } from '@app/infrastructure/modules/rabbitmq/contracts/rabbitmq-options.interface';
import type { OutboxRepository } from '@app/infrastructure/modules/rabbitmq/services/rabbitmq-outbox.service';

@Injectable()
export class InMemoryOutboxRepository implements OutboxRepository {
  private messages: Map<string, RabbitMQOutboxMessage> = new Map();
  private processedIds: Set<string> = new Set();

  async findPending(limit: number): Promise<RabbitMQOutboxMessage[]> {
    const pending: RabbitMQOutboxMessage[] = [];
    for (const msg of this.messages.values()) {
      if (!this.processedIds.has(msg.id) && pending.length < limit) {
        pending.push(msg);
      }
    }
    return pending;
  }

  async markProcessed(id: string): Promise<void> {
    this.processedIds.add(id);
  }

  async incrementRetry(id: string): Promise<void> {
    const msg = this.messages.get(id);
    if (msg) {
      msg.retryCount++;
    }
  }

  async save(message: RabbitMQOutboxMessage): Promise<void> {
    this.messages.set(message.id, message);
  }

  clear(): void {
    this.messages.clear();
    this.processedIds.clear();
  }
}

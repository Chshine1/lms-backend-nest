import { LogBuffer } from '@app/infrastructure/modules/logger/buffer/buffer.interface';
import { Sink } from '@app/infrastructure/modules/logger/pipeline/middlewares.interface';
import { LogEntry } from '@app/infrastructure/modules/logger/contracts/log.entry';

export class MemoryBuffer implements LogBuffer {
  private entries: LogEntry[] = [];

  write(entry: LogEntry): boolean {
    this.entries.push(entry);
    return true;
  }

  async flush(sink: Sink): Promise<void> {
    const logs = [...this.entries];
    this.entries = [];
    for (const entry of logs) {
      try {
        await sink.emit(entry);
      } catch (error) {
        console.error('Failed to emit log during flush', entry, error);
      }
    }
  }

  clear(): void {
    this.entries = [];
  }

  size(): number {
    return this.entries.length;
  }

  getEntries(): LogEntry[] {
    return [...this.entries];
  }
}

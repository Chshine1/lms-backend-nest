import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

export interface DatabaseHealthResult {
  status: 'up' | 'down';
  message: string;
}

@Injectable()
export class DatabaseHealthIndicator {
  constructor(private readonly dataSource: DataSource) {}

  async check(): Promise<DatabaseHealthResult> {
    try {
      await this.dataSource.query('SELECT 1');
      return { status: 'up', message: 'Database connection is healthy' };
    } catch {
      return { status: 'down', message: 'Database connection failed' };
    }
  }
}

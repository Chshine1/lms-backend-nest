import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import {
  HealthIndicatorResult,
  HealthIndicatorService,
} from '@nestjs/terminus';

@Injectable()
export class DatabaseHealthIndicator {
  constructor(
    private readonly dataSource: DataSource,
    private readonly healthIndicatorService: HealthIndicatorService,
  ) {}

  async isHealthy(key: string): Promise<HealthIndicatorResult> {
    const indicator = this.healthIndicatorService.check(key);
    if (!this.dataSource.isInitialized) {
      return indicator.down({ message: 'Database connection not initialized' });
    }

    try {
      await this.dataSource.query('SELECT 1');
      return indicator.up();
    } catch {
      return indicator.down({ message: 'Database connection failed' });
    }
  }
}

import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import {
  HealthIndicatorResult,
  HealthIndicatorService,
} from '@nestjs/terminus';

@Injectable()
export class DatabaseHealthIndicator {
  constructor(
    private readonly em: EntityManager,
    private readonly healthIndicatorService: HealthIndicatorService,
  ) {}

  async isHealthy(key: string): Promise<HealthIndicatorResult> {
    const indicator = this.healthIndicatorService.check(key);

    try {
      const connection = this.em.getConnection();
      await connection.execute('SELECT 1');
      return indicator.up();
    } catch {
      return indicator.down({ message: 'Database connection failed' });
    }
  }
}

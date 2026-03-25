import { Injectable } from '@nestjs/common';
import {
  HealthIndicatorResult,
  HealthIndicatorService,
} from '@nestjs/terminus';
import { LoggerLoader } from '@app/infrastructure';

@Injectable()
export class LoggerHealthIndicator {
  constructor(
    private readonly healthIndicatorService: HealthIndicatorService,
    private readonly loggerLoader: LoggerLoader,
  ) {}

  isHealthy(key: string): Promise<HealthIndicatorResult> {
    const indicator = this.healthIndicatorService.check(key);
    if (!this.loggerLoader.isReady) {
      return Promise.resolve(indicator.down());
    }

    return Promise.resolve(indicator.up());
  }
}

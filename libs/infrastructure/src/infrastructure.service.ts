import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { ConfigurationLoader } from './modules/configuration/configuration.loader';
import { LoggerLoader } from './modules/logger/logger.loader';

@Injectable()
export class InfrastructureService implements OnApplicationBootstrap {
  constructor(
    private configLoader: ConfigurationLoader,
    private loggerLoader: LoggerLoader,
  ) {}
  
  async onApplicationBootstrap() {
    await Promise.all([
      this.configLoader.load(),
      this.loggerLoader.load(),
    ]);
  }
}
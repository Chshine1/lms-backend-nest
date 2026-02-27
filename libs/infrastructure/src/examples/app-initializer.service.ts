import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { BootstrapCoordinatorService } from '@app/infrastructure/bootstrap-coordinator.service';
import { ConfigModule } from '@app/infrastructure/examples/config/config.module';
import { ConfigRuntimeService } from '@app/infrastructure/examples/config/config-runtime.service';
import { LoggerRuntimeService } from '@app/infrastructure/examples/logger/logger-runtime.service';
import { LoggerModule } from '@app/infrastructure/examples/logger/logger.module';

@Injectable()
export class AppInitializerService implements OnApplicationBootstrap {
  constructor(private readonly coordinator: BootstrapCoordinatorService) {}

  async onApplicationBootstrap(): Promise<void> {
    console.log('Starting application initialization...');

    try {
      await this.upgradeConfigModule();

      await this.upgradeLoggerModule();

      console.log('Application initialization completed successfully!');
    } catch (error) {
      console.error('Application initialization failed:', error);
      throw error;
    }
  }

  private async upgradeConfigModule(): Promise<void> {
    console.log('Upgrading ConfigModule...');

    const configRuntime = new ConfigRuntimeService();

    await configRuntime.loadFromRemote();

    await this.coordinator.upgrade(ConfigModule, configRuntime);

    console.log('ConfigModule upgraded successfully');
  }

  private async upgradeLoggerModule(): Promise<void> {
    console.log('Upgrading LoggerModule...');

    if (!this.coordinator.isUpgraded(ConfigModule)) {
      throw new Error('ConfigModule must be upgraded before LoggerModule');
    }

    const loggerRuntime = new LoggerRuntimeService();

    await loggerRuntime.initialize();

    await this.coordinator.upgrade(LoggerModule, loggerRuntime);

    console.log('LoggerModule upgraded successfully');
  }
}

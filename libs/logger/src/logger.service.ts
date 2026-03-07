import { Inject, Injectable, OnModuleDestroy } from '@nestjs/common';
import { LoggerLibConfig } from '@app/contracts/config/logger-lib.config';
import { BufferService } from '@app/logger/core/services/buffer.service';
import { IsDefined, IsObject, validate, ValidateNested } from 'class-validator';
import { plainToInstance, Type } from 'class-transformer';
import {
  BootstrapEventBusSymbol,
  BootstrapEvents,
} from '@app/infrastructure/infrastructure.module';
import { type Emitter } from 'mitt';
import {
  LogEntry,
  LogLevel,
} from '@app/logger/core/contracts/log-entry.interface';
import { LoggerInstance } from '@app/logger/core/contracts/logger.abstraction';
import { BootstrapLogger } from '@app/logger/core/bootstrap/bootstrap-logger';
import { PinoFactory } from '@app/logger/config/implementations/pino-factory';
import { LoggerConfig } from '@app/logger/core/contracts/logger-config.interface';

@Injectable()
export class LoggerService implements OnModuleDestroy {
  private isRuntime = false;
  private innerLogger: LoggerInstance;

  constructor(
    private readonly bufferService: BufferService,
    @Inject(BootstrapEventBusSymbol)
    private readonly eventBus: Emitter<BootstrapEvents>,
  ) {
    this.innerLogger = new BootstrapLogger(bufferService);
    this.eventBus.on('config.loaded', (config) => {
      void this.upgradeToRuntime(config);
    });
  }

  onModuleDestroy(): void {
    this.eventBus.off('config.loaded');
  }

  async upgradeToRuntime(config: Record<string, unknown>): Promise<void> {
    if (this.isRuntime) {
      return;
    }

    const loggerConfig = await this.getLoggerConfig(config);
    this.innerLogger = new PinoFactory().createLogger(loggerConfig);

    try {
      const entries = this.bufferService.flush();
      for (const entry of entries) {
        await this.innerLogger.log(entry);
      }
    } catch (error) {
      console.error(
        '[Logger] Failed flush buffer when upgrading to the runtime logger.',
        error,
      );
    }

    this.isRuntime = true;
  }

  async log(
    logEntry: Omit<LogEntry, 'metadata' | 'timestamp'> & {
      metadata?: Record<string, unknown>;
      timestamp?: Date;
    },
  ): Promise<void> {
    try {
      await this.innerLogger.log({
        metadata: {},
        timestamp: new Date(),
        ...logEntry,
      });
    } catch (error) {
      console.error('[Logger] Failed to log via innerLogger.', error);
    }
  }

  private async getLoggerConfig(
    config: Record<string, unknown>,
  ): Promise<LoggerConfig> {
    class LoggerConfigurationSection {
      @IsDefined()
      @IsObject()
      @ValidateNested()
      @Type(() => LoggerLibConfig)
      logger!: LoggerLibConfig;
    }

    const newConfig = plainToInstance(LoggerConfigurationSection, config, {
      excludeExtraneousValues: true,
    });

    const errors = await validate(newConfig);
    if (errors.length > 0) {
      await this.log({
        level: LogLevel.fatal,
        message: 'Config validation failed for logger runtime upgrade',
        metadata: { validationErrors: errors },
        timestamp: new Date(),
      });
      process.exit(1);
    }

    return newConfig.logger;
  }
}

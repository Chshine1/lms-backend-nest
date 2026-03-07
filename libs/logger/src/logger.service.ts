import { Inject, Injectable, OnModuleDestroy } from '@nestjs/common';
import { LoggerLibConfig } from '@app/contracts/config/logger-lib.config';
import { LoggerInstance } from '@app/logger/abstractions/logger.abstraction';
import { BufferManagerService } from '@app/logger/services/buffer-manager.service';
import {
  IsDefined,
  IsObject,
  ValidateNested,
  validateSync,
} from 'class-validator';
import { plainToInstance, Type } from 'class-transformer';
import {
  BootstrapEventBusSymbol,
  BootstrapEvents,
} from '@app/infrastructure/infrastructure.module';
import { type Emitter } from 'mitt';
import { LoggerFallbackService } from '@app/logger/services/logger-fallback.service';
import {
  LogEntry,
  LogLevel,
} from '@app/logger/abstractions/log-entry.interface';

@Injectable()
export class LoggerService extends LoggerInstance implements OnModuleDestroy {
  private isRuntime: boolean = false;

  constructor(
    private readonly bufferService: BufferManagerService,
    @Inject(BootstrapEventBusSymbol)
    private readonly eventBus: Emitter<BootstrapEvents>,
    private readonly loggerFallbackService: LoggerFallbackService,
  ) {
    super();
    eventBus.on('config.loaded', (config: Record<string, unknown>) => {
      this.upgradeToRuntime(config);
    });
  }

  onModuleDestroy(): void {
    this.eventBus.off('config.loaded');
  }

  upgradeToRuntime(config: Record<string, unknown>): void {
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
    const errors = validateSync(newConfig);
    if (errors.length > 0) {
      this.logWithLevel(
        LogLevel.fatal,
        'Fatal error when validating config for upgrading logger service to runtime.',
        {
          validationErrors: errors,
        },
      );
      process.exit(1);
    }

    this.isRuntime = true;
    this.bufferService.flush().catch((error: unknown) => {
      throw error;
    });
  }

  child(_metadata: Record<string, unknown>): this {
    return this;
  }

  logWithLevel(
    level: LogLevel,
    message: string,
    metadata: Record<string, unknown>,
  ): void {
    const logEntry: LogEntry = {
      message,
      level,
      timestamp: new Date(),
      metadata,
    };

    this.loggerFallbackService
      .logWithFallback(logEntry)
      .then(() => {
        if (!this.isRuntime) {
          this.bufferService.add(logEntry);
        }
      })
      .catch((err: unknown) => {
        throw err;
      });
  }
}

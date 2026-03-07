import { Inject, Injectable, OnModuleDestroy } from '@nestjs/common';
import {
  LoggerLibConfig,
  LogLevel,
} from '@app/contracts/config/logger-lib.config';
import { LoggerInstance } from '@app/logger/interfaces/logger.interface';
import { BufferManagerService } from '@app/logger/services/buffer-manager.service';
import { PipelineManagerService } from '@app/logger/services/pipeline-manager.service';
import { LogEntry } from '@app/logger/interfaces/pipeline.interface';
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
import type { LoggerConfig } from '@app/logger/interfaces/logger-config.interface';
import { LoggerFactory } from '@app/logger/interfaces/logger-factory.interface';

@Injectable()
export class LoggerService extends LoggerInstance implements OnModuleDestroy {
  private readonly innerLogger: LoggerInstance;
  private isRuntime: boolean = false;

  constructor(
    @Inject('LOGGER_CONFIG') config: LoggerConfig,
    @Inject(LoggerFactory) loggerFactory: LoggerFactory,
    private readonly bufferService: BufferManagerService,
    private readonly pipelineService: PipelineManagerService,
    @Inject(BootstrapEventBusSymbol)
    private readonly eventBus: Emitter<BootstrapEvents>,
  ) {
    super();
    this.innerLogger = loggerFactory.createLogger(config);
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
      this.logWithLevel(
        LogLevel.fatal,
        'Failed to flush buffer during upgrade.',
        {
          error: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : undefined,
          traceId: 'bootstrap',
        },
      );
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

    this.log(logEntry)
      .then(() => {
        if (!this.isRuntime) {
          this.bufferService.add(logEntry);
        }
      })
      .catch((err: unknown) => {
        throw err;
      });
  }

  private async log(logEntry: LogEntry): Promise<void> {
    try {
      await this.pipelineService.processLogEntry(logEntry);
    } catch (pipelineError: unknown) {
      const pipelineMessage =
        pipelineError instanceof Error
          ? pipelineError.message
          : String(pipelineError);

      try {
        this.innerLogger.logWithLevel(
          LogLevel.fatal,
          'Logger pipeline failed. Using direct logger instead.',
          {
            message: pipelineMessage,
          },
        );
      } catch (loggerError: unknown) {
        const loggerMessage =
          loggerError instanceof Error
            ? loggerError.message
            : String(loggerError);
        console.log('[FATAL] Inner logger failed: %s', loggerMessage);
      }
    }
  }
}

import { Inject, Injectable, OnModuleDestroy } from '@nestjs/common';
import {
  LoggerLibConfig,
  LogLevel,
} from '@app/contracts/config/logger-lib.config';
import { LoggerCoreService } from '@app/logger/services/logger-core.service';
import { EventLoggerBase } from '@app/logger/interfaces/logger.interface';
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

@Injectable()
export class LoggerService extends EventLoggerBase implements OnModuleDestroy {
  private isRuntime: boolean = false;

  constructor(
    private readonly coreService: LoggerCoreService,
    private readonly bufferService: BufferManagerService,
    private readonly pipelineService: PipelineManagerService,
    @Inject(BootstrapEventBusSymbol)
    private readonly eventBus: Emitter<BootstrapEvents>,
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

    this.processLogEntry(logEntry);
  }

  private processLogEntry(logEntry: LogEntry): void {
    try {
      if (!this.isRuntime) {
        this.bufferService.add(logEntry);
      } else {
        this.pipelineService
          .processLogEntry(logEntry)
          .catch((error: unknown) => {
            this.handlePipelineError(error, logEntry);
          });
      }
    } catch (error: unknown) {
      this.handleBufferError(error, logEntry);
    }
  }

  private handlePipelineError(error: unknown, logEntry: LogEntry): void {
    const e = error instanceof Error ? error : new Error(String(error));
    console.error('Pipeline processing failed:', e.message);

    try {
      this.bufferService.add(logEntry);
    } catch (bufferError) {
      console.error('Buffer also failed:', bufferError);
    }
  }

  private handleBufferError(error: unknown, logEntry: LogEntry): void {
    const e = error instanceof Error ? error : new Error(String(error));
    console.error('Buffer operation failed:', e.message);

    try {
      this.directLog(logEntry);
    } catch (directError) {
      console.error('Direct logging also failed:', directError);
    }
  }

  private directLog(logEntry: LogEntry): void {
    this.coreService.logWithLevel(
      logEntry.level,
      logEntry.message,
      logEntry.metadata,
    );
  }
}

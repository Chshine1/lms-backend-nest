import { BootstrapCore } from '@app/bootstrap/core';
import { BootstrapToken, ExposeDependency } from '@app/bootstrap/decorators';
import { IBootstrap } from '@app/bootstrap/interfaces';
import {
  type ClassConstructor,
  plainToInstance,
  Type,
} from 'class-transformer';
import {
  IsDefined,
  IsObject,
  IsString,
  ValidateNested,
  validateSync,
} from 'class-validator';

@BootstrapToken('user-service')
abstract class IConfigurationCentre implements IBootstrap {
  protected abstract _get<T extends object>(config: ClassConstructor<T>): T;
  abstract bootstrap(): Promise<void>;
  abstract createRuntime(): unknown;

  @ExposeDependency('get')
  get<T extends object>(config: ClassConstructor<T>): T {
    return this._get<T>(config);
  }
}

@BootstrapToken('logger')
abstract class ILogger implements IBootstrap {
  protected abstract _log(message: string): void;
  protected abstract _switchConfig(): void;
  abstract bootstrap(): Promise<void>;
  abstract createRuntime(): unknown;

  @ExposeDependency('log')
  log(message: string): void {
    this._log(message);
  }
  @ExposeDependency('switchConfig')
  switchConfig(): void {
    this._switchConfig();
  }
}

class ConsoleLogger extends ILogger {
  private loggerInstance: string = '';
  constructor(private readonly configCentre: IConfigurationCentre) {
    super();
  }

  protected override _switchConfig(): void {
    class LoggerSection {
      @IsDefined()
      @IsString()
      url!: string;
    }
    class LoggerConfig {
      @IsDefined()
      @IsObject()
      @Type(() => LoggerSection)
      @ValidateNested()
      logger!: LoggerSection;
    }
    const config = this.configCentre.get(LoggerConfig);
    this.loggerInstance = config.logger.url;
  }
  protected override _log(message: string): void {
    console.log(`[BOOTSTRAP_LOG@${this.loggerInstance}] ${message}`);
  }

  override bootstrap(): Promise<void> {
    this.loggerInstance = 'console';
    return Promise.resolve();
  }
  override createRuntime(): unknown {
    return new RuntimeLogger(this.loggerInstance);
  }
}

class RuntimeLogger {
  constructor(private readonly url: string) {}

  log(message: string): void {
    console.log(`[LOG@${this.url}] ${message}`);
  }
}

class ConfigurationCentre extends IConfigurationCentre {
  private config: Record<string, unknown> = {};
  constructor(private readonly logger: ILogger) {
    super();
  }

  protected override _get<T extends object>(config: ClassConstructor<T>): T {
    const result = plainToInstance(config, this.config, {
      excludeExtraneousValues: true,
    });
    const errors = validateSync(result);
    if (errors.length > 0) {
      this.logger.log(JSON.stringify(errors));
    }
    return result;
  }
  override bootstrap(): Promise<void> {
    this.config['logger'] = {
      url: 'http://localhost:8080',
    };
    return Promise.resolve();
  }
  override createRuntime(): unknown {
    return new ConfigurationProvider(this.config);
  }
}

class ConfigurationProvider {
  constructor(private readonly config: Record<string, unknown>) {}

  get<T extends object>(config: ClassConstructor<T>): T {
    return plainToInstance(config, this.config, {
      excludeExtraneousValues: true,
    });
  }
}

const bootstrapCore = new BootstrapCore();

bootstrapCore.register(ILogger, ConsoleLogger);
bootstrapCore.register(IConfigurationCentre, ConfigurationCentre);

void bootstrapCore.bootstrap();

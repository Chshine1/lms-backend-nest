import { ConfigurationService } from '@app/infrastructure/modules/configuration/configuration.service';
import { type LoggerService } from '@nestjs/common';
import { LoaderPipelineService } from '@app/infrastructure/modules/configuration/pipeline/loader-pipeline.service';
import { ModuleLoader } from '@app/infrastructure/modules/module-loader.interface';

export class ConfigurationLoader implements ModuleLoader {
  private readonly configurationService: ConfigurationService;
  private ready: boolean = false;

  private serviceInnerConfiguration: Record<string, unknown> = {};

  constructor(
    loggerService: LoggerService,
    private readonly loaderPipelineService: LoaderPipelineService,
  ) {
    this.configurationService = new ConfigurationService(
      this.serviceInnerConfiguration,
      loggerService,
    );
  }

  async load(): Promise<void> {
    this.serviceInnerConfiguration = await this.loaderPipelineService.process(
      {},
    );
    this.ready = true;
  }

  get service(): ConfigurationService {
    return this.configurationService;
  }

  get isReady(): boolean {
    return this.ready;
  }
}

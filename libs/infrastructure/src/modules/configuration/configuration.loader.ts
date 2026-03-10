import { ConfigurationService } from '@app/infrastructure/modules/configuration/configuration.service';
import { Injectable } from '@nestjs/common';
import { LoaderPipelineService } from '@app/infrastructure/modules/configuration/pipeline/loader-pipeline.service';
import { ModuleLoader } from '@app/infrastructure/modules/module-loader.interface';

@Injectable()
export class ConfigurationLoader implements ModuleLoader {
  private readonly configurationService: ConfigurationService;
  private ready: boolean = false;

  private serviceInnerConfiguration: Record<string, unknown> = {};

  constructor(private readonly loaderPipelineService: LoaderPipelineService) {
    this.configurationService = new ConfigurationService(
      this.serviceInnerConfiguration,
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

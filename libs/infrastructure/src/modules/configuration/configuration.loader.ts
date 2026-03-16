import { ConfigurationServiceDependencies } from '@app/infrastructure/modules/configuration/configuration.service';
import { Injectable } from '@nestjs/common';
import { LoaderPipelineService } from '@app/infrastructure/modules/configuration/pipeline/loader-pipeline.service';

@Injectable()
export class ConfigurationLoader {
  private ready: boolean = false;

  constructor(
    private readonly loaderPipelineService: LoaderPipelineService,
    private readonly serviceDependencies: ConfigurationServiceDependencies,
  ) {}

  async load(): Promise<void> {
    this.serviceDependencies.configuration =
      await this.loaderPipelineService.process({});
    this.ready = true;
  }

  get isReady(): boolean {
    return this.ready;
  }
}

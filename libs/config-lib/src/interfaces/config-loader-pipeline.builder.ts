import { LoaderDefinition } from '@app/config-lib/interfaces/loader.config';

export class ConfigLoaderPipelineBuilder<
  TPipeline extends LoaderDefinition<object, unknown[]>[],
> {
  constructor(private readonly pipeline: TPipeline) {}

  static create(): ConfigLoaderPipelineBuilder<[]> {
    return new ConfigLoaderPipelineBuilder<[]>([]);
  }

  append<TSchema extends object, TDeps extends unknown[]>(
    loader: LoaderDefinition<TSchema, TDeps>,
  ): ConfigLoaderPipelineBuilder<
    [...TPipeline, LoaderDefinition<TSchema, TDeps>]
  > {
    return new ConfigLoaderPipelineBuilder<
      [...TPipeline, LoaderDefinition<TSchema, TDeps>]
    >([...this.pipeline, loader]);
  }

  build(): TPipeline {
    return this.pipeline;
  }
}

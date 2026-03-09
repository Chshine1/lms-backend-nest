import { LoaderMiddleware } from '@app/infrastructure/modules/configuration/pipeline/loader.middleware';
import { Inject } from '@nestjs/common';
import { merge } from 'lodash';
import { EventBusService } from '@app/infrastructure/modules/event-bus/event-bus.service';

export const configurationLoadersMiddlewaresToken = Symbol(
  'configurationLoadersMiddlewares',
);

export class LoaderPipelineService {
  constructor(
    private readonly eventBusService: EventBusService,
    @Inject(configurationLoadersMiddlewaresToken)
    private readonly middlewares: LoaderMiddleware[],
  ) {}

  async process(
    initialConfig: Record<string, unknown>,
  ): Promise<Record<string, unknown>> {
    let result: Record<string, unknown> = initialConfig;

    for (const middleware of this.middlewares) {
      const newPart = await middleware.loadValidated(initialConfig);
      result = merge(result, newPart);
      this.eventBusService.emit('config.loaded', result);
    }

    return result;
  }
}

import { LoaderMiddleware } from '@app/infrastructure/modules/configuration/pipeline/loader.middleware';
import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { merge } from 'lodash';
import { EventBusService } from '@app/infrastructure/modules/event-bus/event-bus.service';
import { LoggerService } from '@app/infrastructure/modules/logger/logger.service';
import { LogLevel } from '@app/infrastructure/modules/logger/contracts/log.entry';

export const configurationLoadersMiddlewaresToken = Symbol(
  'configurationLoadersMiddlewares',
);

@Injectable()
export class LoaderPipelineService {
  constructor(
    @Inject(forwardRef(() => LoggerService))
    private readonly loggerService: LoggerService,
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
      void this.loggerService.log({
        level: LogLevel.INFO,
        message: 'config loaded',
      });
      this.eventBusService.emit('config.loaded', {});
    }

    return result;
  }
}

import { LoaderMiddleware } from '@app/infrastructure/modules/configuration/pipeline/loader.middleware';
import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { merge } from 'lodash';
import { LoggerService } from '@app/infrastructure/modules/logger/logger.service';
import { LogLevel } from '@app/infrastructure/modules/logger/contracts/log.entry';
import { BootstrapEventBus } from '@app/infrastructure/modules/event-bus/event-bus.module';

export const configurationLoadersMiddlewaresToken = Symbol(
  'configurationLoadersMiddlewares',
);

@Injectable()
export class LoaderPipelineService {
  constructor(
    @Inject(forwardRef(() => LoggerService))
    private readonly loggerService: LoggerService,
    private readonly eventBusService: BootstrapEventBus,
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

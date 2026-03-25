import { LoaderMiddleware } from './loader.middleware';
import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { merge } from 'lodash';
import { LoggerService } from '../../logger/logger.service';
import { BootstrapEventBus } from '../../event-bus/event-bus.module';
import { LogLevel } from '@app/contracts';

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
    }

    this.eventBusService.emit('config.loaded', result);
    return result;
  }
}

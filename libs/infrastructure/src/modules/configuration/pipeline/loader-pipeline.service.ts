import { LoaderMiddleware } from './loader.middleware';
import { Inject, Injectable } from '@nestjs/common';
import { merge } from 'lodash';

export const configurationLoadersMiddlewaresToken = Symbol(
  'configurationLoadersMiddlewares',
);

@Injectable()
export class LoaderPipelineService {
  constructor(
    @Inject(configurationLoadersMiddlewaresToken)
    private readonly middlewares: LoaderMiddleware[],
  ) {}

  async process(
    initialConfig: Record<string, unknown>,
  ): Promise<Record<string, unknown>> {
    let result: Record<string, unknown> = initialConfig;

    for (const middleware of this.middlewares) {
      const newPart = await middleware.loadValidated(result);
      result = merge(result, newPart);
      console.log('config loaded:', middleware.constructor.name);
    }

    return result;
  }
}

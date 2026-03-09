import {
  ClassConstructor,
  instanceToPlain,
  plainToInstance,
} from 'class-transformer';
import { validateSync } from 'class-validator';

type ConstructorArray<TTypeArray extends object[]> = TTypeArray extends [
  infer TFirst,
  ...infer TRest,
]
  ? [
      ClassConstructor<TFirst>,
      ...(TRest extends object[] ? ConstructorArray<TRest> : never),
    ]
  : [];

export interface LoaderMiddleware {
  loadValidated(
    loaded: Record<string, unknown>,
  ): Promise<Record<string, unknown>>;
}

export abstract class LoaderMiddlewareBase<
  TDependencies extends object[],
> implements LoaderMiddleware {
  constructor(
    protected readonly dependencies: ConstructorArray<TDependencies>,
    protected readonly target: ClassConstructor<object>,
  ) {}

  protected abstract load(
    dependencies: TDependencies,
  ): Promise<Record<string, unknown>>;

  async loadValidated(
    loaded: Record<string, unknown>,
  ): Promise<Record<string, unknown>> {
    const dependencies = this.dependencies.map((cls) => {
      const dependency = plainToInstance(cls, loaded, {
        excludeExtraneousValues: true,
      });
      const validationErrors = validateSync(dependency);
      if (validationErrors.length > 0) {
        /* TODO */
      }
      return dependency;
    }) as TDependencies;

    const newSection = await this.load(dependencies);

    const typedSection = plainToInstance(this.target, newSection, {
      excludeExtraneousValues: true,
    });
    const validationErrors = validateSync(typedSection);
    if (validationErrors.length > 0) {
      /* TODO */
    }

    return {
      ...loaded,
      ...instanceToPlain(typedSection),
    };
  }
}

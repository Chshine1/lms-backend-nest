import { ConfigBootstrapModule } from './config-bootstrap.module';
import { ConfigRuntimeModule } from './config-runtime.module';
import { Infrastructure } from '@app/infrastructure/decorators/infrastructure.decorator';

@Infrastructure({
  bootstrap: ConfigBootstrapModule,
  runtime: ConfigRuntimeModule,
  bootstrapDeps: [],
  runtimeDeps: [],
})
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class ConfigModule {}

import { LoggerBootstrapModule } from './logger-bootstrap.module';
import { LoggerRuntimeModule } from './logger-runtime.module';
import { ConfigModule } from '../config/config.module';
import { Infrastructure } from '@app/infrastructure/decorators/infrastructure.decorator';

@Infrastructure({
  bootstrap: LoggerBootstrapModule,
  runtime: LoggerRuntimeModule,
  bootstrapDeps: [],
  runtimeDeps: [ConfigModule],
})
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class LoggerModule {}

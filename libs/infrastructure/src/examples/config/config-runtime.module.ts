import { Module } from '@nestjs/common';
import { ConfigRuntimeService } from './config-runtime.service';
import { CONFIG_SERVICE_TOKEN } from './config-bootstrap.module';

@Module({
  providers: [
    {
      provide: CONFIG_SERVICE_TOKEN,
      useClass: ConfigRuntimeService,
    },
    ConfigRuntimeService,
  ],
  exports: [CONFIG_SERVICE_TOKEN, ConfigRuntimeService],
})
export class ConfigRuntimeModule {}

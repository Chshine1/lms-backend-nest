import { Module } from '@nestjs/common';
import { ConfigBootstrapService } from './config-bootstrap.service';

export const CONFIG_SERVICE_TOKEN = Symbol('CONFIG_SERVICE');

@Module({
  providers: [
    {
      provide: CONFIG_SERVICE_TOKEN,
      useClass: ConfigBootstrapService,
    },
    ConfigBootstrapService,
  ],
  exports: [CONFIG_SERVICE_TOKEN, ConfigBootstrapService],
})
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class ConfigBootstrapModule {}

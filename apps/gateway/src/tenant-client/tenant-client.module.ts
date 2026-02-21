import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { TenantClientService } from './tenant-client.service';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'TENANT_SERVICE',
        transport: Transport.TCP,
        options: {
          host: process.env['TENANT_SERVICE_HOST'] || 'localhost',
          port: parseInt(process.env['TENANT_SERVICE_PORT'] || '3002'),
        },
      },
    ]),
  ],
  providers: [TenantClientService],
  exports: [TenantClientService],
})
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class TenantClientModule {}

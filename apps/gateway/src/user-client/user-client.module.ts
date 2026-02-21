import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { UserClientService } from './user-client.service';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'USER_SERVICE',
        transport: Transport.TCP,
        options: {
          host: process.env['USER_SERVICE_HOST'] || 'localhost',
          port: parseInt(process.env['USER_SERVICE_PORT'] || '3001'),
        },
      },
    ]),
  ],
  providers: [UserClientService],
  exports: [UserClientService],
})
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class UserClientModule {}

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Tenant } from './entities/tenant.entity';
import { TenantController } from './tenant.controller';
import { TenantService } from './tenant.service';
import { ConfigLibModule } from '@app/config-lib/config-lib.module';

@Module({
  imports: [
    ConfigLibModule.forRoot({
      order: ['env', 'yaml', 'aws'] as const,
    }),
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'data/tenant-service.db',
      entities: [Tenant],
      synchronize: true,
    }),
    TypeOrmModule.forFeature([Tenant]),
  ],
  controllers: [TenantController],
  providers: [TenantService],
})
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class AppModule {}

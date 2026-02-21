import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Tenant } from './entities/tenant.entity';
import { TenantController } from './tenant.controller';
import { TenantService } from './tenant.service';

@Module({
  imports: [
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

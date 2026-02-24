import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Tenant } from './entities/tenant.entity';
import { TenantController } from './tenant.controller';
import { TenantService } from './tenant.service';
import { ConfigLibModule } from '@app/config-lib/config-lib.module';
import { globalConfigLoaderPipeline } from '@app/contracts/config-loader-pipeline.global';

@Module({
  imports: [
    ConfigLibModule.forRoot({
      loadersPipeline: globalConfigLoaderPipeline,
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

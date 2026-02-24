import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { ConfigLibModule } from '@app/config-lib/config-lib.module';
import { globalConfigLoaderPipeline } from '@app/contracts/config-loader-pipeline.global';

@Module({
  imports: [
    ConfigLibModule.forRoot({
      loadersPipeline: globalConfigLoaderPipeline,
    }),
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'data/user-service.db',
      entities: [User],
      synchronize: true,
    }),
    TypeOrmModule.forFeature([User]),
  ],
  controllers: [UserController],
  providers: [UserService],
})
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class AppModule {}

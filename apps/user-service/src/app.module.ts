import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { ConfigLibModule } from '@app/config-lib/config-lib.module';

@Module({
  imports: [
    ConfigLibModule.forRoot({
      order: ['env', 'yaml', 'aws'],
      initial: {
        environment: process.env['NODE_ENV'] || 'production',
        serviceName: 'user-service',
      },
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

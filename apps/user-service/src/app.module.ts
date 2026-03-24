import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { User } from './entities/user.entity';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { PermissionModule } from '@app/authentication/permission/permission.module';
import { UserPermission } from '@/user-service/src/entities/user-permission.entity';
import { ConfigurationService } from '@app/infrastructure/modules/configuration/configuration.service';
import { InfrastructureModule } from '@app/infrastructure/infrastructure.module';
import { IsDefined, IsString } from 'class-validator';
import { Tenant } from '@/user-service/src/entities/tenant.entity';
import { Student } from '@/user-service/src/entities/student.entity';
import { Teacher } from '@/user-service/src/entities/teacher.entity';
import { Parent } from '@/user-service/src/entities/parent.entity';
import { Admin } from '@/user-service/src/entities/admin.entity';
import { Campus } from '@/user-service/src/entities/campus.entity';

class TypeOrmConfigSection {
  @IsString()
  @IsDefined()
  host!: string;
  @IsString()
  @IsDefined()
  port!: number;
  @IsString()
  @IsDefined()
  username!: string;
  @IsString()
  @IsDefined()
  password!: string;
  @IsString()
  @IsDefined()
  database!: string;
}

class RabbitMQConfigSection {
  @IsString()
  @IsDefined()
  host!: string;
  @IsString()
  @IsDefined()
  port!: number;
  @IsString()
  @IsDefined()
  username!: string;
  @IsString()
  @IsDefined()
  password!: string;
}

@Module({
  imports: [
    InfrastructureModule.forRoot(),
    TypeOrmModule.forRootAsync({
      useFactory: (configService: ConfigurationService) => {
        const section = configService.get(TypeOrmConfigSection);
        return {
          type: 'postgres',
          host: section.host,
          port: section.port,
          username: section.username,
          password: section.password,
          database: section.database,
          entities: [
            User,
            Tenant,
            Student,
            Teacher,
            Parent,
            Admin,
            Campus,
            UserPermission,
          ],
          synchronize: false,
        };
      },
      inject: [ConfigurationService],
    }),
    RabbitMQModule.forRootAsync({
      useFactory: (configService: ConfigurationService) => {
        const section = configService.get(RabbitMQConfigSection);
        return {
          exchanges: [
            {
              name: 'user-service',
              type: 'topic',
            },
          ],
          uri: `amqp://${section.username}:${section.password}@${section.host}:${section.port}`,
          connectionInitOptions: { wait: true },
        };
      },
      inject: [ConfigurationService],
    }),
    PermissionModule.forFeature(UserPermission),
  ],
  controllers: [UserController],
  providers: [UserService],
})
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class AppModule {}

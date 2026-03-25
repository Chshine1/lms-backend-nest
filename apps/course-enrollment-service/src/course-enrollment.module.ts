import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { CourseEnrollmentController } from './course-enrollment.controller';
import { CourseEnrollmentService } from './course-enrollment.service';
import { Enrollment } from './entities/enrollment.entity';
import {
  ConfigurationService,
  InfrastructureModule,
} from '@app/infrastructure';
import { IsDefined, IsString } from 'class-validator';

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
          entities: [Enrollment],
          synchronize: false,
        };
      },
      inject: [ConfigurationService],
    }),
    TypeOrmModule.forFeature([Enrollment]),
    RabbitMQModule.forRootAsync({
      useFactory: (configService: ConfigurationService) => {
        const section = configService.get(RabbitMQConfigSection);
        return {
          exchanges: [
            {
              name: 'course-enrollment-service',
              type: 'topic',
            },
          ],
          uri: `amqp://${section.username}:${section.password}@${section.host}:${section.port.toString()}`,
          connectionInitOptions: { wait: true },
        };
      },
      inject: [ConfigurationService],
    }),
  ],
  controllers: [CourseEnrollmentController],
  providers: [CourseEnrollmentService],
})
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class CourseEnrollmentModule {}

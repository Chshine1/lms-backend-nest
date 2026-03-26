import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { CourseSchedulingController } from './course-scheduling.controller';
import { CourseSchedulingService } from './course-scheduling.service';
import { CourseSchedule } from './entities/course-schedule.entity';
import {
  ConfigurationService,
  InfrastructureModule,
} from '@app/infrastructure';
import { IsDefined, IsString } from 'class-validator';

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
    InfrastructureModule.forRootAsync(),
    TypeOrmModule.forRoot(),
    TypeOrmModule.forFeature([CourseSchedule]),
    RabbitMQModule.forRootAsync({
      useFactory: (configService: ConfigurationService) => {
        const section = configService.get(RabbitMQConfigSection);
        return {
          exchanges: [
            {
              name: 'course-scheduling-service',
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
  controllers: [CourseSchedulingController],
  providers: [CourseSchedulingService],
})
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class CourseSchedulingModule {}

import { Module } from '@nestjs/common';
import { CourseController } from './course.controller';
import { TypedClientModule, UserTypedClient } from '@app/typed-client';
import { CoreModule } from '@app/core';

@Module({
  imports: [
    CoreModule.forRoot({
      endpointsProtocol: 'rabbitmq',
      entities: [],
      exchanges: [
        { name: 'course-service', type: 'topic' },
        { name: 'user-service', type: 'topic' },
      ],
    }),
    TypedClientModule.forFeature([
      {
        mqOptions: {
          exchange: 'user-service',
        },
        client: UserTypedClient,
      },
    ]),
  ],
  controllers: [CourseController],
})
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class CourseModule {}

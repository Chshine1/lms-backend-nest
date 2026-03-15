import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { CourseServiceModule } from './../src/course-service.module';

describe('CourseServiceController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [CourseServiceModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });
});

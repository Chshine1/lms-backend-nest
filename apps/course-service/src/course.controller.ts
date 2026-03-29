import { Controller } from '@nestjs/common';
import { CourseService } from './course.service';
import { CourseTypedClient, ExtractController } from '@app/typed-client';

@Controller()
export class CourseController implements ExtractController<CourseTypedClient> {
  constructor(private readonly courseService: CourseService) {}
}

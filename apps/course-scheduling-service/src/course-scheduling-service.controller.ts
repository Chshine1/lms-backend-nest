import { Controller, Get } from '@nestjs/common';
import { CourseSchedulingServiceService } from './course-scheduling-service.service';

@Controller()
export class CourseSchedulingServiceController {
  constructor(private readonly courseSchedulingServiceService: CourseSchedulingServiceService) {}

  @Get()
  getHello(): string {
    return this.courseSchedulingServiceService.getHello();
  }
}

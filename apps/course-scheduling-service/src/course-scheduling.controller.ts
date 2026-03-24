import { Controller, Get } from '@nestjs/common';
import { CourseSchedulingService } from './course-scheduling.service';

@Controller()
export class CourseSchedulingController {
  constructor(
    private readonly courseSchedulingServiceService: CourseSchedulingService,
  ) {}

  @Get()
  getHello(): string {
    return this.courseSchedulingServiceService.getHello();
  }
}

import { Controller, Get } from '@nestjs/common';
import { CourseEnrollmentService } from './course-enrollment.service';

@Controller()
export class CourseEnrollmentController {
  constructor(
    private readonly courseEnrollmentServiceService: CourseEnrollmentService,
  ) {}

  @Get()
  getHello(): string {
    return this.courseEnrollmentServiceService.getHello();
  }
}

import { Controller, Get } from '@nestjs/common';
import { CourseEnrollmentServiceService } from './course-enrollment-service.service';

@Controller()
export class CourseEnrollmentServiceController {
  constructor(private readonly courseEnrollmentServiceService: CourseEnrollmentServiceService) {}

  @Get()
  getHello(): string {
    return this.courseEnrollmentServiceService.getHello();
  }
}

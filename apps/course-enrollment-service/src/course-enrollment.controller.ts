import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { CourseEnrollmentService } from './course-enrollment.service';
import { CreateEnrollmentDto } from './dto/create-enrollment.dto';
import { Enrollment } from './entities/enrollment.entity';

@Controller('enrollments')
export class CourseEnrollmentController {
  constructor(
    private readonly courseEnrollmentService: CourseEnrollmentService,
  ) {}

  @Post()
  enrollStudent(
    @Body() createEnrollmentDto: CreateEnrollmentDto,
  ): Promise<Enrollment> {
    return this.courseEnrollmentService.enrollStudent(createEnrollmentDto);
  }

  @Get('course/:courseId')
  getEnrollmentsByCourse(
    @Param('courseId', ParseIntPipe) courseId: number,
  ): Promise<Enrollment[]> {
    return this.courseEnrollmentService.getEnrollmentsByCourse(courseId);
  }

  @Get('student/:studentId')
  getEnrollmentsByStudent(
    @Param('studentId', ParseIntPipe) studentId: number,
  ): Promise<Enrollment[]> {
    return this.courseEnrollmentService.getEnrollmentsByStudent(studentId);
  }

  @Get(':id')
  getEnrollmentById(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<Enrollment> {
    return this.courseEnrollmentService.getEnrollmentById(id);
  }

  @Delete(':id')
  unenrollStudent(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.courseEnrollmentService.unenrollStudent(id);
  }

  @Delete('student/:studentId/course/:courseId')
  unenrollByStudentAndCourse(
    @Param('studentId', ParseIntPipe) studentId: number,
    @Param('courseId', ParseIntPipe) courseId: number,
  ): Promise<void> {
    return this.courseEnrollmentService.unenrollByStudentAndCourse(
      studentId,
      courseId,
    );
  }
}

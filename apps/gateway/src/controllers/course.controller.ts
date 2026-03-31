import { Body, Controller, Get, Param, Post, Put } from '@nestjs/common';
import { CourseTypedClient } from '@app/typed-client';
import {
  AssignmentContract,
  CourseContract,
  CourseMaterialContract,
  CourseUnitContract,
  CreateCourseDto,
} from '@app/contracts';

@Controller('courses')
export class CourseController {
  constructor(private readonly courseClient: CourseTypedClient) {}

  @Post()
  async createCourse(@Body() data: CreateCourseDto): Promise<CourseContract> {
    return await this.courseClient.createCourse(data);
  }

  @Get(':id')
  async getCourse(@Param('id') id: string): Promise<{
    course: CourseContract;
    courseUnits: CourseUnitContract[];
  }> {
    return await this.courseClient.findCourseWithUnits({
      courseId: Number(id),
    });
  }

  @Get(':courseId/units/:courseUnitId')
  async getCourseUnit(
    @Param('courseId') courseId: string,
    @Param('courseUnitId') courseUnitId: string,
  ): Promise<{
    assignments: AssignmentContract[];
    courseMaterials: CourseMaterialContract[];
  }> {
    return await this.courseClient.findUnitDetail({
      courseId: Number(courseId),
      courseUnitId: Number(courseUnitId),
    });
  }
  @Put(':id')
  async batchUpdateCourse(
    @Param('id') id: string,
    @Body() data: CreateCourseDto,
  ): Promise<CourseContract> {
    return await this.courseClient.batchUpdateCourse({
      courseId: Number(id),
      data,
    });
  }
}

import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { CourseTypedClient } from '@app/typed-client';
import { CreateCourseDto, CourseDto } from '@app/contracts';

@Controller('courses')
export class CourseController {
  constructor(private readonly courseClient: CourseTypedClient) {}

  @Post()
  async createCourse(@Body() data: CreateCourseDto): Promise<CourseDto> {
    return await this.courseClient.createCourse({
      dto: data,
      creatorUserId: BigInt(0),
    });
  }

  @Get(':id')
  async getCourse(@Param('id') id: string): Promise<{
    course: CourseDto;
    courseUnits: Array<{
      id: bigint;
      courseId: bigint;
      title: string;
      description?: string;
      position: number;
    }>;
  }> {
    return await this.courseClient.findCourseWithUnits({
      courseId: BigInt(id),
    });
  }

  @Get(':courseId/units/:courseUnitId')
  async getCourseUnit(
    @Param('courseId') courseId: string,
    @Param('courseUnitId') courseUnitId: string,
  ): Promise<{
    assignments: Array<{
      id: bigint;
      courseUnitId: bigint;
      title: string;
      description: string;
      dueDate: Date;
      attachments: bigint[];
    }>;
    courseMaterials: Array<{
      id: bigint;
      courseUnitId: bigint;
      fileId: bigint;
      title: string;
    }>;
  }> {
    return await this.courseClient.findUnitDetail({
      courseId: BigInt(courseId),
      courseUnitId: BigInt(courseUnitId),
    });
  }

  @Post(':courseId/enrollments')
  async enrollStudent(
    @Param('courseId') courseId: string,
    @Body() body: { studentId: bigint; enrollerUserId: bigint },
  ): Promise<void> {
    return await this.courseClient.enrollStudent({
      courseId: BigInt(courseId),
      studentId: body.studentId,
      enrollerUserId: body.enrollerUserId,
    });
  }
}

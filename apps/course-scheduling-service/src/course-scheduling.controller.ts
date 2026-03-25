import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
} from '@nestjs/common';
import { CourseSchedulingService } from './course-scheduling.service';
import { CourseScheduleContract } from '@app/contracts/course-scheduling/entities/course-schedule.contract';
import { CreateScheduleDto } from '@app/contracts/course-scheduling/dto/create-schedule.dto';
import { UpdateScheduleDto } from '@app/contracts/course-scheduling/dto/update-schedule.dto';

@Controller('schedules')
export class CourseSchedulingController {
  constructor(
    private readonly courseSchedulingService: CourseSchedulingService,
  ) {}

  @Post()
  createSchedule(
    @Body() createScheduleDto: CreateScheduleDto,
  ): Promise<CourseScheduleContract> {
    return this.courseSchedulingService.createSchedule(createScheduleDto);
  }

  @Get('course/:courseId')
  getSchedulesByCourse(
    @Param('courseId', ParseIntPipe) courseId: number,
  ): Promise<CourseScheduleContract[]> {
    return this.courseSchedulingService.getSchedulesByCourse(courseId);
  }

  @Get(':id')
  getScheduleById(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<CourseScheduleContract> {
    return this.courseSchedulingService.getScheduleById(id);
  }

  @Put(':id')
  updateSchedule(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateScheduleDto: UpdateScheduleDto,
  ): Promise<CourseScheduleContract> {
    return this.courseSchedulingService.updateSchedule(id, updateScheduleDto);
  }

  @Delete(':id')
  deleteSchedule(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<void> {
    return this.courseSchedulingService.deleteSchedule(id);
  }
}

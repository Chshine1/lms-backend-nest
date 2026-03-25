import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { plainToInstance } from 'class-transformer';
import { CourseSchedule } from './entities/course-schedule.entity';
import { CourseScheduleContract } from '@app/contracts/course-scheduling/entities/course-schedule.contract';
import { CreateScheduleDto } from '@app/contracts/course-scheduling/dto/create-schedule.dto';
import { UpdateScheduleDto } from '@app/contracts/course-scheduling/dto/update-schedule.dto';

@Injectable()
export class CourseSchedulingService {
  constructor(
    @InjectRepository(CourseSchedule)
    private scheduleRepository: Repository<CourseSchedule>,
  ) {}

  async createSchedule(
    createScheduleDto: CreateScheduleDto,
  ): Promise<CourseScheduleContract> {
    const schedule = this.scheduleRepository.create(createScheduleDto);
    const savedSchedule = await this.scheduleRepository.save(schedule);
    return this.toContract(savedSchedule);
  }

  async getSchedulesByCourse(
    courseId: number,
  ): Promise<CourseScheduleContract[]> {
    const schedules = await this.scheduleRepository.find({
      where: { courseId },
    });
    return schedules.map((s) => this.toContract(s));
  }

  async getScheduleById(id: number): Promise<CourseScheduleContract> {
    const schedule = await this.scheduleRepository.findOne({ where: { id } });
    if (schedule === null) {
      throw new NotFoundException(`Schedule with id ${id} not found`);
    }
    return this.toContract(schedule);
  }

  async updateSchedule(
    id: number,
    updateScheduleDto: UpdateScheduleDto,
  ): Promise<CourseScheduleContract> {
    const schedule = await this.scheduleRepository.findOne({ where: { id } });
    if (schedule === null) {
      throw new NotFoundException(`Schedule with id ${id} not found`);
    }
    const updatedSchedule = this.scheduleRepository.merge(
      schedule,
      updateScheduleDto,
    );
    const savedSchedule = await this.scheduleRepository.save(updatedSchedule);
    return this.toContract(savedSchedule);
  }

  async deleteSchedule(id: number): Promise<void> {
    const schedule = await this.scheduleRepository.findOne({ where: { id } });
    if (schedule === null) {
      throw new NotFoundException(`Schedule with id ${id} not found`);
    }
    await this.scheduleRepository.remove(schedule);
  }

  private toContract(entity: CourseSchedule): CourseScheduleContract {
    return plainToInstance(CourseScheduleContract, entity, {
      excludeExtraneousValues: true,
    });
  }
}

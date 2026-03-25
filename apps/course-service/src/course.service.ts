import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Course } from './entities/course.entity';
import { CourseContract } from '@app/contracts';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class CourseService {
  constructor(
    @InjectRepository(Course)
    private courseRepository: Repository<Course>,
  ) {}

  async findById(id: number): Promise<CourseContract | null> {
    const findResult = await this.courseRepository.findOne({ where: { id } });
    if (findResult === null) return null;
    return plainToInstance(CourseContract, findResult, {
      excludeExtraneousValues: true,
    });
  }
}

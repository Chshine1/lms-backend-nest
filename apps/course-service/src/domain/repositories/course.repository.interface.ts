import { Course } from '../entities/course.entity';

export interface ICourseRepository {
  save(course: Course): Promise<void>;
  findById(id: bigint): Promise<Course | null>;
  findByCode(code: string): Promise<Course | null>;
}

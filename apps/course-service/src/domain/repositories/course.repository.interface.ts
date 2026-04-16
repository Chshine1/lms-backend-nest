import { Course } from '../entities/course.entity';

export interface ICourseRepository {
  save(course: Course): Promise<void>;
  findById(id: bigint): Promise<Course | null>;
  findByCode(code: string): Promise<Course | null>;
  findUnitsByCourseId(courseId: bigint): Promise<
    Array<{
      id: bigint;
      courseId: bigint;
      title: string;
      description?: string;
      position: number;
    }>
  >;
  findUnitById(courseUnitId: bigint): Promise<{
    id: bigint;
    courseId: bigint;
    title: string;
    description?: string;
    position: number;
  } | null>;
}

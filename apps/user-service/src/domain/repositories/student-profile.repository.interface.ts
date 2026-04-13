import { StudentProfile } from '../entities/student-profile.entity';

export interface IStudentProfileRepository {
  save(profile: StudentProfile): Promise<void>;
  findByUserId(userId: bigint): Promise<StudentProfile | null>;
}

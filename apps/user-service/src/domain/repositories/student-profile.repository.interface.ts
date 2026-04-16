import { StudentProfile } from '../entities/student-profile.entity';

export interface IStudentProfileRepository {
  save(profile: StudentProfile): Promise<void>;

  /**
   * Find student profile by user ID with optional relationship loading.
   * @param userId User ID
   * @param options.include Optional array of relationship keys to load
   *        Supported: 'user' - loads User aggregate
   */
  findByUserId(
    userId: bigint,
    options?: { include?: string[] },
  ): Promise<StudentProfile | null>;
}

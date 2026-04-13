import { UserRoleAssignment } from '../entities/user-role-link.entity';

export interface IUserRoleAssignmentRepository {
  save(assignment: UserRoleAssignment): Promise<void>;
  findByUserId(userId: number): Promise<UserRoleAssignment[]>;
  delete(userId: number, roleId: number): Promise<void>;
}

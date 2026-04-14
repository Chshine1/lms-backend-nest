import { UserRoleLink } from '../entities/user-role-link.entity';

export interface IUserRoleAssignmentRepository {
  save(assignment: UserRoleLink): Promise<void>;
  findByUserId(userId: number): Promise<UserRoleLink[]>;
  delete(userId: number, roleId: number): Promise<void>;
}

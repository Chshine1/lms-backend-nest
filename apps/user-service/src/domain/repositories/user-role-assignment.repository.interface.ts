import { UserRoleLink } from '../entities/user-role-link.entity';

export interface IUserRoleAssignmentRepository {
  save(assignment: UserRoleLink): Promise<void>;

  /**
   * Find all role assignments for a user.
   */
  findByUserId(userId: bigint): Promise<UserRoleLink[]>;

  /**
   * Find all users assigned to a specific role.
   */
  findByRoleId(roleId: bigint): Promise<UserRoleLink[]>;

  /**
   * Delete a role assignment for a user.
   */
  delete(userId: bigint, roleId: bigint): Promise<void>;
}

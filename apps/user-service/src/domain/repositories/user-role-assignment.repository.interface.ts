import { UserRoleLink } from '../entities/user-role-link.entity';

export interface IUserRoleAssignmentRepository {
  save(assignment: UserRoleLink): Promise<void>;
  findByUserId(userId: bigint): Promise<UserRoleLink[]>;
  delete(userId: bigint, roleId: bigint): Promise<void>;
}

import { User } from '../entities/user.entity';
import { Role } from '../entities/role.entity';
import { EmailVo, PhoneNumberVo } from '../value-objects/index';

export interface IUserRepository {
  save(user: User): Promise<void>;

  /**
   * Find user by ID with optional relationship loading.
   * @param id User ID
   * @param options.include Optional array of relationship keys to load
   *        Supported: 'roles' - loads UserRoleLink entities
   */
  findById(id: bigint, options?: { include?: string[] }): Promise<User | null>;

  /**
   * Find user by email (case-insensitive).
   */
  findByEmail(email: EmailVo): Promise<User | null>;

  /**
   * Check if phone number is registered.
   */
  existsByPhone(phone: PhoneNumberVo): Promise<boolean>;

  /**
   * Get all roles assigned to a user.
   */
  getRoles(userId: bigint): Promise<Role[]>;
}

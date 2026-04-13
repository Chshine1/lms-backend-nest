import { User } from '../entities/user.entity';
import { Role } from '../entities/role.entity';
import { EmailVo, PhoneNumberVo } from '@app/contracts';

export interface IUserRepository {
  save(user: User): Promise<void>;
  findById(id: bigint): Promise<User | null>;
  findByEmail(email: EmailVo): Promise<User | null>;
  existsByPhone(phone: PhoneNumberVo): Promise<boolean>;
  getRoles(userId: bigint): Promise<Role[]>;
}

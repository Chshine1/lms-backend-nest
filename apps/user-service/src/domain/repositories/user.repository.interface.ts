import { User } from '../entities/user.entity';
import { Email } from '../value-objects/email.value-object';
import { PhoneNumber } from '../value-objects/phone-number.value-object';
import { Role } from '../entities/role.entity';

export interface IUserRepository {
  save(user: User): Promise<void>;
  findById(id: bigint): Promise<User | null>;
  findByEmail(email: Email): Promise<User | null>;
  existsByPhone(phone: PhoneNumber): Promise<boolean>;
  getRoles(userId: bigint): Promise<Role[]>;
}

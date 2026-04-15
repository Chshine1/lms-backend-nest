import { Role } from '../entities/role.entity';

export interface IRoleRepository {
  findById(id: bigint): Promise<Role | null>;
  findByName(name: string): Promise<Role | null>;
}

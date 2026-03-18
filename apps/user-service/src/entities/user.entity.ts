import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
  VersionColumn,
} from 'typeorm';
import {
  IdentityType,
  UserContract,
  UserStatus,
} from '@app/contracts/user/entities/user.contract';

@Entity('users')
@Unique('UQ_user_tenant_username', ['tenantId', 'username'])
@Unique('UQ_user_tenant_email', ['tenantId', 'email'])
// Manually created indices
/*
    CREATE INDEX "IDX_active_user_identity_covering"
    ON "users" ("tenant_id", "identity_type")
    INCLUDE ("username")
    WHERE status = 1 AND deleted_at IS NULL;
*/
@Index('IDX_active_user_identity', { synchronize: false })
export class User implements UserContract {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'tenant_id' })
  tenantId!: number;

  @Column()
  username!: string;

  @Column()
  email!: string;

  @Column({ nullable: true })
  phone?: string;

  @Column({ name: 'password_hash' })
  passwordHash!: string;

  @Column({
    type: 'smallint',
    default: UserStatus.ACTIVE,
    transformer: {
      to: (value: UserStatus) => value,
      from: (value: number) => value as UserStatus,
    },
  })
  status!: UserStatus;

  @Column({
    name: 'identity_type',
    type: 'smallint',
    transformer: {
      to: (value: IdentityType) => value,
      from: (value: number) => value as IdentityType,
    },
  })
  identityType!: IdentityType;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt?: Date;

  @VersionColumn()
  version!: number;
}

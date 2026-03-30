import { Column, Entity, Index, OneToOne, Unique } from 'typeorm';
import {
  BaseEntity,
  IdentityType,
  UserContract,
  UserStatus,
} from '@app/contracts';
import { Student } from '@/user-service/src/entities/user/student.entity';
import { Teacher } from '@/user-service/src/entities/user/teacher.entity';

@Entity('users')
@Unique('UQ_user_tenant_username', ['tenantId', 'username'])
@Unique('UQ_user_tenant_email', ['tenantId', 'email'])
// Manually created indices
/*
    CREATE INDEX "IDX_active_user_identity"
    ON "users" ("tenant_id", "identity_type")
    INCLUDE ("username")
    WHERE status = 1 AND deleted_at IS NULL;
*/
@Index('IDX_active_user_identity', { synchronize: false })
export class User extends BaseEntity implements UserContract {
  @Column({ name: 'tenant_id' })
  tenantId!: number;

  @Column()
  username!: string;

  @Column()
  email!: string;

  @Column()
  phone!: string;

  @Column({ name: 'password_hash' })
  passwordHash!: string;

  @Column({
    type: 'smallint',
    default: UserStatus.INACTIVE,
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

  @OneToOne(() => Student, (student) => student.user, {
    cascade: true,
  })
  student?: Student;

  @OneToOne(() => Teacher, (teacher) => teacher.user, {
    cascade: true,
  })
  teacher?: Teacher;
}

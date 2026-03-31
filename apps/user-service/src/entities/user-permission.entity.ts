import {
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  PrimaryColumn,
} from 'typeorm';
import { type Permission } from '@app/authentication';

export enum UserServiceResource {
  USER = 1,
}

export enum UserServiceAction {
  READ = 1,
  WRITE = 2,
  DELETE = 3,
  MANAGE = 4,
}

@Entity('user_permissions')
export class UserPermission implements Permission {
  @PrimaryColumn()
  userId!: number;

  @PrimaryColumn({
    type: 'smallint',
    transformer: {
      to: (value: UserServiceResource) => value,
      from: (value: number) => value as UserServiceResource,
    },
  })
  resource!: UserServiceResource;

  @PrimaryColumn({
    type: 'smallint',
    transformer: {
      to: (value: UserServiceAction) => value,
      from: (value: number) => value as UserServiceAction,
    },
  })
  action!: UserServiceAction;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt?: Date;
}
